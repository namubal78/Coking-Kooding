package com.cookingcooding.workout.repository;

import com.cookingcooding.workout.entity.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    Optional<WorkoutLog> findByExerciseIdAndLogDate(Long exerciseId, LocalDate logDate);
    List<WorkoutLog> findByLogDate(LocalDate logDate);
    List<WorkoutLog> findByLogDateBetween(LocalDate start, LocalDate end);
}
