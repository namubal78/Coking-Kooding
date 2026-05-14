package com.cookingcooding.workout.service;

import com.cookingcooding.auth.entity.User;
import com.cookingcooding.auth.repository.UserRepository;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final ExerciseRepository exerciseRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final WorkoutVideoRepository workoutVideoRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-key:}")
    private String serviceKey;

    private static final String VIDEO_BUCKET = "workout-videos";

    // ── Auth helpers ──────────────────────────────────────────────────

    private String currentEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private User currentUser() {
        return userRepository.findByEmail(currentEmail())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private Exercise findExercise(Long id) {
        return exerciseRepository.findByIdAndUserEmail(id, currentEmail())
                .orElseThrow(() -> new IllegalArgumentException("운동을 찾을 수 없습니다."));
    }

    // ── Exercise CRUD ──────────────────────────────────────────────────

    public List<ExerciseResponse> getExercises() {
        return exerciseRepository.findByUserEmailOrderByOrderIndexAsc(currentEmail()).stream()
                .map(ExerciseResponse::of).toList();
    }

    public ExerciseResponse createExercise(ExerciseRequest req) {
        User user = currentUser();
        int orderIndex = req.orderIndex() > 0 ? req.orderIndex()
                : (int) exerciseRepository.countByUserEmail(currentEmail());
        Exercise exercise = Exercise.builder()
                .name(req.name())
                .totalSets(req.totalSets())
                .orderIndex(orderIndex)
                .restSeconds(req.restSeconds() > 0 ? req.restSeconds() : 60)
                .durationSeconds(Math.max(req.durationSeconds(), 0))
                .user(user)
                .build();
        return ExerciseResponse.of(exerciseRepository.save(exercise));
    }

    public ExerciseResponse updateExercise(Long id, ExerciseRequest req) {
        Exercise exercise = findExercise(id);
        exercise.setName(req.name());
        exercise.setTotalSets(req.totalSets());
        exercise.setOrderIndex(req.orderIndex());
        exercise.setRestSeconds(req.restSeconds() > 0 ? req.restSeconds() : 60);
        exercise.setDurationSeconds(Math.max(req.durationSeconds(), 0));
        return ExerciseResponse.of(exerciseRepository.save(exercise));
    }

    public void deleteExercise(Long id) {
        exerciseRepository.delete(findExercise(id));
    }

    // ── Workout Logs ──────────────────────────────────────────────────

    public List<WorkoutLogResponse> getDayLogs(LocalDate date) {
        return workoutLogRepository.findByExercise_UserEmailAndLogDate(currentEmail(), date).stream()
                .map(WorkoutLogResponse::of).toList();
    }

    @Transactional
    public WorkoutLogResponse incrementSet(Long exerciseId, LocalDate date) {
        String email = currentEmail();
        Exercise exercise = findExercise(exerciseId);
        WorkoutLog log = workoutLogRepository
                .findByExercise_IdAndExercise_UserEmailAndLogDate(exerciseId, email, date)
                .orElse(WorkoutLog.builder().exercise(exercise).logDate(date).completedSets(0).build());
        if (log.getCompletedSets() < exercise.getTotalSets()) {
            log.setCompletedSets(log.getCompletedSets() + 1);
        }
        return WorkoutLogResponse.of(workoutLogRepository.save(log));
    }

    // ── Statistics ────────────────────────────────────────────────────

    public List<DayStatsResponse> getWeekStats(LocalDate start, LocalDate end) {
        String email = currentEmail();
        List<Exercise> exercises = exerciseRepository.findByUserEmailOrderByOrderIndexAsc(email);
        int totalPerDay = exercises.stream().mapToInt(Exercise::getTotalSets).sum();

        List<WorkoutLog> logs = workoutLogRepository.findByExercise_UserEmailAndLogDateBetween(email, start, end);
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
        String email = currentEmail();
        List<Exercise> exercises = exerciseRepository.findByUserEmailOrderByOrderIndexAsc(email);
        List<WorkoutLog> logs = workoutLogRepository.findByExercise_UserEmailAndLogDate(email, date);
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
        findExercise(exerciseId); // 소유권 확인
        return workoutVideoRepository.findByExerciseId(exerciseId)
                .map(v -> Map.of("url", getPublicVideoUrl(v.getStoragePath())))
                .orElse(Map.of("url", ""));
    }

    public WorkoutVideoResponse uploadVideo(Long exerciseId, MultipartFile file) throws IOException {
        Exercise exercise = findExercise(exerciseId);

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
        findExercise(exerciseId); // 소유권 확인
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
        return "";
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
