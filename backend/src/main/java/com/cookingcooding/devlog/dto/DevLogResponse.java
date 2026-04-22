package com.cookingcooding.devlog.dto;

import com.cookingcooding.devlog.entity.DevLog;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DevLogResponse(
        Long id,
        LocalDate logDate,
        String title,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static DevLogResponse of(DevLog d) {
        return new DevLogResponse(d.getId(), d.getLogDate(), d.getTitle(), d.getContent(), d.getCreatedAt(), d.getUpdatedAt());
    }
}
