package com.cookingcooding.photos.repository;

import com.cookingcooding.photos.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findAllByOrderByUploadedAtDesc();
}
