package com.cookingcooding.slack.controller;

import com.cookingcooding.slack.service.SlackService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/slack")
@RequiredArgsConstructor
public class SlackController {

    @Value("${slack.signing-secret:}")
    private String signingSecret;

    private final SlackService slackService;

    @PostMapping("/events")
    public ResponseEntity<?> events(@RequestBody Map<String, Object> payload) {
        // Slack URL 인증 챌린지 응답
        if ("url_verification".equals(payload.get("type"))) {
            return ResponseEntity.ok(Map.of("challenge", payload.get("challenge")));
        }

        // 이벤트 처리
        if ("event_callback".equals(payload.get("type"))) {
            @SuppressWarnings("unchecked")
            Map<String, Object> event = (Map<String, Object>) payload.get("event");
            if (event == null) return ResponseEntity.ok().build();

            String eventType = (String) event.get("type");
            // 봇 자신의 메시지 무시
            if (event.containsKey("bot_id")) return ResponseEntity.ok().build();

            if ("app_mention".equals(eventType) || "message".equals(eventType)) {
                String text = (String) event.get("text");
                if (text != null && !text.isBlank()) {
                    // 멘션 태그 제거
                    String question = text.replaceAll("<@[^>]+>", "").trim();
                    if (!question.isBlank()) {
                        new Thread(() -> {
                            String answer = slackService.askClaude(question);
                            slackService.sendNotification(answer);
                        }).start();
                    }
                }
            }
        }

        return ResponseEntity.ok().build();
    }
}
