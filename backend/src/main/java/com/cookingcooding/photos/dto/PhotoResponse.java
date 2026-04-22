package com.cookingcooding.photos.dto;

import com.cookingcooding.photos.entity.Photo;

import java.time.LocalDateTime;

public record PhotoResponse(Long id, String fileName, String publicUrl, String uploadedBy, LocalDateTime uploadedAt) {
    public static PhotoResponse from(Photo p) {
        return new PhotoResponse(p.getId(), p.getFileName(), p.getPublicUrl(), p.getUploadedBy(), p.getUploadedAt());
    }
}
