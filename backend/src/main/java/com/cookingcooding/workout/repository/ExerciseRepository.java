package com.cookingcooding.workout.repository;

import com.cookingcooding.workout.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findAllByOrderByOrderIndexAsc();
}
