package com.cookingkooding.planner.repository;

import com.cookingkooding.planner.entity.PlannerItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlannerRepository extends JpaRepository<PlannerItem, Long> {
    List<PlannerItem> findByUserEmailOrderByDateAsc(String email);
}
