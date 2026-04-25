package com.cookingcooding.workout.dto;

import com.cookingcooding.workout.entity.Exercise;

public record ExerciseResponse(Long id, String name, int totalSets, int orderIndex, int restSeconds, int durationSeconds) {
    public static ExerciseResponse of(Exercise e) {
        return new ExerciseResponse(e.getId(), e.getName(), e.getTotalSets(), e.getOrderIndex(), e.getRestSeconds(), e.getDurationSeconds());
    }
}
