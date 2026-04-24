package com.cookingcooding.workout.dto;

import java.util.List;

public record WorkoutVoiceRequest(String text, List<String> exerciseNames) {}
