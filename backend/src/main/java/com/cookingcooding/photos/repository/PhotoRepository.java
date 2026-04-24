package com.cookingcooding.photos.repository;

import com.cookingcooding.photos.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findAllByOrderByUploadedAtDesc();

    @Query("SELECT COALESCE(SUM(p.fileSize), 0) FROM Photo p WHERE p.fileSize IS NOT NULL")
    Long sumFileSize();
}
