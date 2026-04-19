package com.cookingcooding.files.repository;

import com.cookingcooding.files.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
    List<UploadedFile> findAllByOrderByUploadedAtDesc();
}
