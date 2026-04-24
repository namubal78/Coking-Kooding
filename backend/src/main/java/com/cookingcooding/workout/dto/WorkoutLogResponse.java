package com.cookingcooding.workout.dto;

import com.cookingcooding.workout.entity.WorkoutLog;

public record WorkoutLogResponse(Long exerciseId, String date, int completedSets) {
    public static WorkoutLogResponse of(WorkoutLog log) {
        return new WorkoutLogResponse(
                log.getExercise().getId(),
                log.getLogDate().toString(),
                log.getCompletedSets()
        );
    }
}
