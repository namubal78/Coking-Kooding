package com.cookingcooding.notification;

import com.cookingcooding.planner.entity.PlannerItem;
import com.cookingcooding.slack.service.SlackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SlackService slackService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${notification.phone:01099957146}")
    private String notificationPhone;

    @Value("${coolsms.api-key:}")
    private String coolsmsApiKey;

    @Value("${coolsms.api-secret:}")
    private String coolsmsApiSecret;

    @Value("${coolsms.sender:}")
    private String coolsmsSender;

    private static final String COOLSMS_URL = "https://api.coolsms.co.kr/messages/v4/send";

    public void sendAll(PlannerItem item) {
        sendSlack(item);
        sendSms(item.getTitle(), item.getDate());
        // TODO: 이메일 알림 추가 시 spring-boot-starter-mail 의존성 추가 후 여기에 구현
    }

    private void sendSlack(PlannerItem item) {
        String text = String.format(":calendar: *일정 알림* — %s (%s)%s",
                item.getTitle(),
                item.getDate(),
                item.getDescription() != null ? "\n> " + item.getDescription() : "");
        slackService.sendNotification(text);
    }

    private void sendSms(String title, String date) {
        if (coolsmsApiKey.isBlank() || coolsmsApiSecret.isBlank() || coolsmsSender.isBlank()) {
            log.debug("CoolSMS 미설정 — SMS 건너뜀");
            return;
        }
        try {
            String dateStr = Instant.now().toString();
            String salt = UUID.randomUUID().toString().replace("-", "");
            String signature = hmacSha256(dateStr + salt, coolsmsApiSecret);
            String authHeader = String.format("HMAC-SHA256 apiKey=%s, date=%s, salt=%s, signature=%s",
                    coolsmsApiKey, dateStr, salt, signature);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", authHeader);

            Map<String, Object> body = Map.of("message", Map.of(
                    "to", notificationPhone,
                    "from", coolsmsSender,
                    "text", String.format("[코킹쿠딩] 일정: %s (%s)", title, date)
            ));

            restTemplate.postForObject(COOLSMS_URL, new HttpEntity<>(body, headers), Map.class);
            log.info("SMS 알림 발송: {}", title);
        } catch (Exception e) {
            log.warn("SMS 알림 실패: {}", e.getMessage());
        }
    }

    private String hmacSha256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
