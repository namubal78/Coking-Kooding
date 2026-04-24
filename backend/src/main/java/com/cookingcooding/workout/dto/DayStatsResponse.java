package com.cookingcooding.workout.dto;

public record DayStatsResponse(String date, int totalSets, int completedSets, double completionRate) {}
