package com.cookingcooding.workout.repository;

import com.cookingcooding.workout.entity.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByExercise_UserEmailAndLogDate(String email, LocalDate logDate);
    List<WorkoutLog> findByExercise_UserEmailAndLogDateBetween(String email, LocalDate start, LocalDate end);
    Optional<WorkoutLog> findByExercise_IdAndExercise_UserEmailAndLogDate(Long exerciseId, String email, LocalDate logDate);
}
