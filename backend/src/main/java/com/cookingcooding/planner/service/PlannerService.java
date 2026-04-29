package com.cookingcooding.planner.service;

import com.cookingcooding.auth.entity.User;
import com.cookingcooding.auth.repository.UserRepository;
import com.cookingcooding.planner.dto.PlannerRequest;
import com.cookingcooding.planner.entity.PlannerItem;
import com.cookingcooding.planner.repository.PlannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        return plannerRepository.save(PlannerItem.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .date(req.getDate())
                .notifyAt(parseNotifyAt(req.getNotifyAt()))
                .user(currentUser())
                .build());
    }

    public PlannerItem update(Long id, PlannerRequest req) {
        PlannerItem item = findById(id);
        item.setTitle(req.getTitle());
        item.setDescription(req.getDescription());
        item.setDate(req.getDate());
        item.setNotifyAt(parseNotifyAt(req.getNotifyAt()));
        item.setNotified(false); // 알림 시간이 바뀌면 재발송 가능하도록 초기화
        return plannerRepository.save(item);
    }

    public void delete(Long id) {
        plannerRepository.delete(findById(id));
    }

    private PlannerItem findById(Long id) {
        return plannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));
    }

    private LocalDateTime parseNotifyAt(String notifyAt) {
        if (notifyAt == null || notifyAt.isBlank()) return null;
        try {
            return LocalDateTime.parse(notifyAt);
        } catch (Exception e) {
            return null;
        }
    }

    private String currentEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private User currentUser() {
        return userRepository.findByEmail(currentEmail())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
