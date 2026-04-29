package com.cookingcooding.workout.repository;

import com.cookingcooding.workout.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByUserEmailOrderByOrderIndexAsc(String email);
    Optional<Exercise> findByIdAndUserEmail(Long id, String email);
    long countByUserEmail(String email);
}
