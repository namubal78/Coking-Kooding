package com.cookingkooding.files.repository;

import com.cookingkooding.files.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
    List<UploadedFile> findAllByOrderByUploadedAtDesc();
}
