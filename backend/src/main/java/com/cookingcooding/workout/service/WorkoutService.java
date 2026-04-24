package com.cookingcooding.workout.service;

import com.cookingcooding.workout.dto.*;
import com.cookingcooding.workout.entity.Exercise;
import com.cookingcooding.workout.entity.WorkoutLog;
import com.cookingcooding.workout.repository.ExerciseRepository;
import com.cookingcooding.workout.repository.WorkoutLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final ExerciseRepository exerciseRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${anthropic.api-key:}")
    private String apiKey;

    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";

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
                .build();
        return ExerciseResponse.of(exerciseRepository.save(exercise));
    }

    public ExerciseResponse updateExercise(Long id, ExerciseRequest req) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));
        exercise.setName(req.name());
        exercise.setTotalSets(req.totalSets());
        exercise.setOrderIndex(req.orderIndex());
        return ExerciseResponse.of(exerciseRepository.save(exercise));
    }

    public void deleteExercise(Long id) {
        exerciseRepository.deleteById(id);
    }

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
}
