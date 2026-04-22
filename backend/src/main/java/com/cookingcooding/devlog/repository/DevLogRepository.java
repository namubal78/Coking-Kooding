package com.cookingcooding.devlog.repository;

import com.cookingcooding.devlog.entity.DevLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DevLogRepository extends JpaRepository<DevLog, Long> {
    Optional<DevLog> findByLogDate(LocalDate logDate);
    List<DevLog> findAllByOrderByLogDateDesc();
}
