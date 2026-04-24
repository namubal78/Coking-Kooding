package com.cookingcooding.workout.dto;

import com.cookingcooding.workout.entity.WorkoutVideo;

public record WorkoutVideoResponse(Long id, Long exerciseId, String fileName, String url) {
    public static WorkoutVideoResponse of(WorkoutVideo v, String url) {
        return new WorkoutVideoResponse(v.getId(), v.getExercise().getId(), v.getFileName(), url);
    }
}
