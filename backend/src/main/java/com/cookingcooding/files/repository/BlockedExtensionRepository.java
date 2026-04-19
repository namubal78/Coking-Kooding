package com.cookingcooding.files.repository;

import com.cookingcooding.files.entity.BlockedExtension;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlockedExtensionRepository extends JpaRepository<BlockedExtension, Long> {
    Optional<BlockedExtension> findByExtension(String extension);
    boolean existsByExtension(String extension);
}
