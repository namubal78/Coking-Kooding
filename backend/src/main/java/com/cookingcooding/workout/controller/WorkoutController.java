package com.cookingcooding.workout.controller;

import com.cookingcooding.workout.dto.*;
import com.cookingcooding.workout.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping("/exercises")
    public List<ExerciseResponse> getExercises() {
        return workoutService.getExercises();
    }

    @PostMapping("/exercises")
    public ExerciseResponse createExercise(@RequestBody ExerciseRequest req) {
        return workoutService.createExercise(req);
    }

    @PutMapping("/exercises/{id}")
    public ExerciseResponse updateExercise(@PathVariable Long id, @RequestBody ExerciseRequest req) {
        return workoutService.updateExercise(id, req);
    }

    @DeleteMapping("/exercises/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        workoutService.deleteExercise(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs")
    public List<WorkoutLogResponse> getDayLogs(@RequestParam(defaultValue = "") String date) {
        LocalDate d = date.isEmpty() ? LocalDate.now() : LocalDate.parse(date);
        return workoutService.getDayLogs(d);
    }

    @PostMapping("/logs/{exerciseId}/increment")
    public WorkoutLogResponse increment(
            @PathVariable Long exerciseId,
            @RequestParam(defaultValue = "") String date) {
        LocalDate d = date.isEmpty() ? LocalDate.now() : LocalDate.parse(date);
        return workoutService.incrementSet(exerciseId, d);
    }

    @GetMapping("/stats")
    public List<DayStatsResponse> getStats(
            @RequestParam String start,
            @RequestParam String end) {
        return workoutService.getWeekStats(LocalDate.parse(start), LocalDate.parse(end));
    }

    @PostMapping("/voice")
    public Map<String, String> parseVoice(@RequestBody WorkoutVoiceRequest req) {
        String exerciseName = workoutService.parseVoice(req.text(), req.exerciseNames());
        return Map.of("exerciseName", exerciseName);
    }
}
