package com.cookingcooding.photos.dto;

import com.cookingcooding.photos.entity.Photo;

import java.time.LocalDateTime;

public record PhotoResponse(Long id, String fileName, String publicUrl, String uploadedBy, LocalDateTime uploadedAt) {

    public static PhotoResponse of(Photo p, String signedUrl) {
        return new PhotoResponse(p.getId(), p.getFileName(), signedUrl, p.getUploadedBy(), p.getUploadedAt());
    }
}
