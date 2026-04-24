package com.cookingcooding.workout.dto;

public record ExerciseDetailStatsResponse(
        Long exerciseId,
        String name,
        int completedSets,
        int totalSets,
        double completionRate
) {}
