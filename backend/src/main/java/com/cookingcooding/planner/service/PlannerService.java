package com.cookingcooding.planner.service;

import com.cookingcooding.auth.entity.User;
import com.cookingcooding.auth.repository.UserRepository;
import com.cookingcooding.planner.dto.PlannerRequest;
import com.cookingcooding.planner.entity.PlannerItem;
import com.cookingcooding.planner.repository.PlannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlannerService {

    private final PlannerRepository plannerRepository;
    private final UserRepository userRepository;

    public List<PlannerItem> getAll() {
        return plannerRepository.findByUserEmailOrderByDateAsc(currentEmail());
    }

    public PlannerItem create(PlannerRequest req) {
        User user = currentUser();
        return plannerRepository.save(PlannerItem.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .date(req.getDate())
                .user(user)
                .build());
    }

    public PlannerItem update(Long id, PlannerRequest req) {
        PlannerItem item = findById(id);
        item.setTitle(req.getTitle());
        item.setDescription(req.getDescription());
        item.setDate(req.getDate());
        return plannerRepository.save(item);
    }

    public void delete(Long id) {
        plannerRepository.delete(findById(id));
    }

    private PlannerItem findById(Long id) {
        return plannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));
    }

    private String currentEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private User currentUser() {
        return userRepository.findByEmail(currentEmail())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
