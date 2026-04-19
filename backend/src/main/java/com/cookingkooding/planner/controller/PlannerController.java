package com.cookingkooding.planner.controller;

import com.cookingkooding.planner.dto.PlannerRequest;
import com.cookingkooding.planner.entity.PlannerItem;
import com.cookingkooding.planner.service.PlannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planner")
@RequiredArgsConstructor
public class PlannerController {

    private final PlannerService plannerService;

    @GetMapping
    public ResponseEntity<List<PlannerItem>> getAll() {
        return ResponseEntity.ok(plannerService.getAll());
    }

    @PostMapping
    public ResponseEntity<PlannerItem> create(@Valid @RequestBody PlannerRequest req) {
        return ResponseEntity.ok(plannerService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlannerItem> update(@PathVariable Long id,
                                              @Valid @RequestBody PlannerRequest req) {
        return ResponseEntity.ok(plannerService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        plannerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
