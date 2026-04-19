package com.cookingcooding.blog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class PostRequest {
    @NotBlank private String title;
    @NotBlank private String category;
    @NotBlank private String content;
    private String excerpt;
    private String tags;
}
