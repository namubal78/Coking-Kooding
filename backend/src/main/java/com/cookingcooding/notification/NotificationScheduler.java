package com.cookingcooding.notification;

import com.cookingcooding.planner.entity.PlannerItem;
import com.cookingcooding.planner.repository.PlannerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final PlannerRepository plannerRepository;
    private final NotificationService notificationService;

    // 매 분 실행: notify_at이 지났고 아직 발송 안 된 일정을 찾아 알림 전송
    @Scheduled(cron = "0 * * * * *")
    public void sendDueNotifications() {
        List<PlannerItem> due = plannerRepository
                .findByNotifyAtIsNotNullAndNotifyAtBeforeAndNotifiedFalse(LocalDateTime.now());

        for (PlannerItem item : due) {
            try {
                notificationService.sendAll(item);
                item.setNotified(true);
                plannerRepository.save(item);
                log.info("알림 발송 완료: id={} title={}", item.getId(), item.getTitle());
            } catch (Exception e) {
                log.error("알림 발송 실패: id={} error={}", item.getId(), e.getMessage());
            }
        }
    }
}
