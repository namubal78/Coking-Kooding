package com.cookingcooding.planner.repository;

import com.cookingcooding.planner.entity.PlannerItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlannerRepository extends JpaRepository<PlannerItem, Long> {
    List<PlannerItem> findByUserEmailOrderByDateAsc(String email);
}
