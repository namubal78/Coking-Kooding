package com.cookingcooding.workout.repository;

import com.cookingcooding.workout.entity.WorkoutVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WorkoutVideoRepository extends JpaRepository<WorkoutVideo, Long> {
    Optional<WorkoutVideo> findByExerciseId(Long exerciseId);
}
