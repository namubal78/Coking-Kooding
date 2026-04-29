package com.cookingcooding.planner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class PlannerRequest {
    @NotBlank private String title;
    private String description;
    @NotBlank private String date;
    private String notifyAt; // ISO datetime "2026-04-27T09:00", null = 알림 없음
}
