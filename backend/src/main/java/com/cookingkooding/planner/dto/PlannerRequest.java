package com.cookingkooding.planner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class PlannerRequest {
    @NotBlank private String title;
    private String description;
    @NotBlank private String date;
}
