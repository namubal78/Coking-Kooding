package com.cookingcooding.slack.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SlackService {

    @Value("${slack.bot-token:}")
    private String botToken;

    @Value("${slack.channel-id:}")
    private String channelId;

    @Value("${anthropic.api-key:}")
    private String anthropicKey;

    private static final String SLACK_API = "https://slack.com/api/chat.postMessage";
    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendNotification(String text) {
        if (botToken.isBlank() || channelId.isBlank()) return;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + botToken);

        Map<String, String> body = Map.of("channel", channelId, "text", text);
        try {
            restTemplate.postForObject(SLACK_API, new HttpEntity<>(body, headers), Map.class);
        } catch (Exception ignored) {}
    }

    public String askClaude(String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", anthropicKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 1024,
                "system", "당신은 Coking-Cooding 프로젝트를 함께 개발하는 AI 어시스턴트입니다. Spring Boot, Next.js, 배포 관련 질문에 한국어로 간결하게 답변하세요.",
                "messages", List.of(Map.of("role", "user", "content", userMessage))
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    ANTHROPIC_URL, new HttpEntity<>(body, headers), Map.class);
            if (response == null) return "응답 없음";
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
            return (String) content.get(0).get("text");
        } catch (Exception e) {
            return "오류: " + e.getMessage();
        }
    }
}
