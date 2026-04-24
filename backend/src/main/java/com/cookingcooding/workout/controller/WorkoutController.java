package com.cookingcooding.workout.controller;

import com.cookingcooding.workout.dto.*;
import com.cookingcooding.workout.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    // ── Exercise CRUD ──────────────────────────────────────────────────

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

    // ── Logs ──────────────────────────────────────────────────────────

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

    // ── Stats ─────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public List<DayStatsResponse> getStats(
            @RequestParam String start,
            @RequestParam String end) {
        return workoutService.getWeekStats(LocalDate.parse(start), LocalDate.parse(end));
    }

    @GetMapping("/stats/detail")
    public List<ExerciseDetailStatsResponse> getDetailStats(
            @RequestParam String date) {
        return workoutService.getDetailStats(LocalDate.parse(date));
    }

    // ── Video ─────────────────────────────────────────────────────────

    @GetMapping("/exercises/{id}/video")
    public Map<String, String> getVideo(@PathVariable Long id) {
        return workoutService.getVideo(id);
    }

    @PostMapping("/exercises/{id}/video")
    public WorkoutVideoResponse uploadVideo(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return workoutService.uploadVideo(id, file);
    }

    @DeleteMapping("/exercises/{id}/video")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long id) {
        workoutService.deleteVideo(id);
        return ResponseEntity.noContent().build();
    }

    // ── Voice ─────────────────────────────────────────────────────────

    @PostMapping("/voice")
    public Map<String, String> parseVoice(@RequestBody WorkoutVoiceRequest req) {
        return Map.of("exerciseName", workoutService.parseVoice(req.text(), req.exerciseNames()));
    }
}
