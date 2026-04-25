package com.cookingcooding.workout.service;

import com.cookingcooding.workout.dto.*;
import com.cookingcooding.workout.entity.Exercise;
import com.cookingcooding.workout.entity.WorkoutLog;
import com.cookingcooding.workout.entity.WorkoutVideo;
import com.cookingcooding.workout.repository.ExerciseRepository;
import com.cookingcooding.workout.repository.WorkoutLogRepository;
import com.cookingcooding.workout.repository.WorkoutVideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final ExerciseRepository exerciseRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final WorkoutVideoRepository workoutVideoRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${anthropic.api-key:}")
    private String apiKey;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-key:}")
    private String serviceKey;

    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";
    private static final String VIDEO_BUCKET = "workout-videos";

    // ── Exercise CRUD ──────────────────────────────────────────────────

    public List<ExerciseResponse> getExercises() {
        return exerciseRepository.findAllByOrderByOrderIndexAsc().stream()
                .map(ExerciseResponse::of).toList();
    }

    public ExerciseResponse createExercise(ExerciseRequest req) {
        int orderIndex = req.orderIndex() > 0 ? req.orderIndex() : (int) exerciseRepository.count();
        Exercise exercise = Exercise.builder()
                .name(req.name())
                .totalSets(req.totalSets())
                .orderIndex(orderIndex)
                .restSeconds(req.restSeconds() > 0 ? req.restSeconds() : 60)
                .durationSeconds(Math.max(req.durationSeconds(), 0))
                .build();
        return ExerciseResponse.of(exerciseRepository.save(exercise));
    }

    public ExerciseResponse updateExercise(Long id, ExerciseRequest req) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));
        exercise.setName(req.name());
        exercise.setTotalSets(req.totalSets());
        exercise.setOrderIndex(req.orderIndex());
        exercise.setRestSeconds(req.restSeconds() > 0 ? req.restSeconds() : 60);
        exercise.setDurationSeconds(Math.max(req.durationSeconds(), 0));
        return ExerciseResponse.of(exerciseRepository.save(exercise));
    }

    public void deleteExercise(Long id) {
        exerciseRepository.deleteById(id);
    }

    // ── Workout Logs ──────────────────────────────────────────────────

    public List<WorkoutLogResponse> getDayLogs(LocalDate date) {
        return workoutLogRepository.findByLogDate(date).stream()
                .map(WorkoutLogResponse::of).toList();
    }

    @Transactional
    public WorkoutLogResponse incrementSet(Long exerciseId, LocalDate date) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));
        WorkoutLog log = workoutLogRepository.findByExerciseIdAndLogDate(exerciseId, date)
                .orElse(WorkoutLog.builder().exercise(exercise).logDate(date).completedSets(0).build());
        if (log.getCompletedSets() < exercise.getTotalSets()) {
            log.setCompletedSets(log.getCompletedSets() + 1);
        }
        return WorkoutLogResponse.of(workoutLogRepository.save(log));
    }

    // ── Statistics ────────────────────────────────────────────────────

    public List<DayStatsResponse> getWeekStats(LocalDate start, LocalDate end) {
        List<Exercise> exercises = exerciseRepository.findAll();
        int totalPerDay = exercises.stream().mapToInt(Exercise::getTotalSets).sum();

        List<WorkoutLog> logs = workoutLogRepository.findByLogDateBetween(start, end);
        Map<LocalDate, Integer> completedByDate = new HashMap<>();
        for (WorkoutLog log : logs) {
            completedByDate.merge(log.getLogDate(), log.getCompletedSets(), Integer::sum);
        }

        List<DayStatsResponse> stats = new ArrayList<>();
        LocalDate cur = start;
        while (!cur.isAfter(end)) {
            int completed = completedByDate.getOrDefault(cur, 0);
            double rate = totalPerDay > 0 ? Math.min((double) completed / totalPerDay * 100, 100) : 0;
            stats.add(new DayStatsResponse(cur.toString(), totalPerDay, completed, rate));
            cur = cur.plusDays(1);
        }
        return stats;
    }

    public List<ExerciseDetailStatsResponse> getDetailStats(LocalDate date) {
        List<Exercise> exercises = exerciseRepository.findAllByOrderByOrderIndexAsc();
        List<WorkoutLog> logs = workoutLogRepository.findByLogDate(date);
        Map<Long, Integer> completedMap = logs.stream()
                .collect(Collectors.toMap(l -> l.getExercise().getId(), WorkoutLog::getCompletedSets));

        return exercises.stream().map(ex -> {
            int completed = completedMap.getOrDefault(ex.getId(), 0);
            double rate = ex.getTotalSets() > 0 ? Math.min((double) completed / ex.getTotalSets() * 100, 100) : 0;
            return new ExerciseDetailStatsResponse(ex.getId(), ex.getName(), completed, ex.getTotalSets(), rate);
        }).toList();
    }

    // ── Video ─────────────────────────────────────────────────────────

    public Map<String, String> getVideo(Long exerciseId) {
        return workoutVideoRepository.findByExerciseId(exerciseId)
                .map(v -> Map.of("url", getPublicVideoUrl(v.getStoragePath())))
                .orElse(Map.of("url", ""));
    }

    public WorkoutVideoResponse uploadVideo(Long exerciseId, MultipartFile file) throws IOException {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));

        workoutVideoRepository.findByExerciseId(exerciseId).ifPresent(old -> {
            String deleteUrl = supabaseUrl + "/storage/v1/object/" + VIDEO_BUCKET + "/" + old.getStoragePath();
            HttpHeaders h = new HttpHeaders();
            h.set("Authorization", "Bearer " + serviceKey);
            try {
                restTemplate.exchange(deleteUrl, HttpMethod.DELETE, new HttpEntity<>(h), String.class);
            } catch (Exception ignored) {}
            workoutVideoRepository.delete(old);
        });

        String ext = getExtension(file.getOriginalFilename());
        String storagePath = UUID.randomUUID() + "." + ext;
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + VIDEO_BUCKET + "/" + storagePath;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.setContentType(MediaType.parseMediaType(
                file.getContentType() != null ? file.getContentType() : "video/mp4"));
        restTemplate.exchange(uploadUrl, HttpMethod.POST, new HttpEntity<>(file.getBytes(), headers), String.class);

        WorkoutVideo video = WorkoutVideo.builder()
                .exercise(exercise)
                .storagePath(storagePath)
                .fileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "video." + ext)
                .uploadedAt(LocalDateTime.now())
                .build();

        return WorkoutVideoResponse.of(workoutVideoRepository.save(video), getPublicVideoUrl(storagePath));
    }

    public void deleteVideo(Long exerciseId) {
        workoutVideoRepository.findByExerciseId(exerciseId).ifPresent(old -> {
            String deleteUrl = supabaseUrl + "/storage/v1/object/" + VIDEO_BUCKET + "/" + old.getStoragePath();
            HttpHeaders h = new HttpHeaders();
            h.set("Authorization", "Bearer " + serviceKey);
            try {
                restTemplate.exchange(deleteUrl, HttpMethod.DELETE, new HttpEntity<>(h), String.class);
            } catch (Exception ignored) {}
            workoutVideoRepository.delete(old);
        });
    }

    // ── Voice ─────────────────────────────────────────────────────────

    public String parseVoice(String text, List<String> exerciseNames) {
        if (exerciseNames.isEmpty()) return "";
        String nameList = String.join(", ", exerciseNames);
        String prompt = """
                운동 목록: [%s]
                음성: "%s"

                어떤 운동을 했다고 말했는지 JSON으로만 반환해줘. 설명 없이 JSON만.
                일치하는 운동이 있으면: {"exerciseName":"운동이름"}
                없으면: {"exerciseName":""}

                규칙:
                - exerciseName은 운동 목록에 있는 이름 그대로
                - "한 세트", "1세트", "했어", "완료", "체크" 등 표현 모두 인식
                - 운동 이름이 비슷하면 가장 가까운 것 선택
                """.formatted(nameList, text);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 64,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    ANTHROPIC_URL, new HttpEntity<>(body, headers), Map.class);
            if (response == null) return "";

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
            String responseText = content.get(0).get("text").toString().trim();

            Matcher m = Pattern.compile("\"exerciseName\"\\s*:\\s*\"([^\"]*)\"").matcher(responseText);
            return m.find() ? m.group(1) : "";
        } catch (Exception e) {
            return "";
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private String getPublicVideoUrl(String storagePath) {
        if (supabaseUrl == null || supabaseUrl.isEmpty()) return "";
        return supabaseUrl + "/storage/v1/object/public/" + VIDEO_BUCKET + "/" + storagePath;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "mp4";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
