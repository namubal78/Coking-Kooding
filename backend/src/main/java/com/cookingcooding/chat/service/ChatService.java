package com.cookingcooding.chat.service;

import com.cookingcooding.chat.dto.ChatRequest;
import com.cookingcooding.chat.dto.ChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    @Value("${anthropic.api-key:}")
    private String apiKey;

    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";

    private final RestTemplate restTemplate = new RestTemplate();

    public ChatResponse chat(ChatRequest req) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        List<Map<String, String>> messages = req.messages().stream()
                .map(m -> Map.of("role", m.role(), "content", m.content()))
                .toList();

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 1024,
                "messages", messages
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        Map<String, Object> response;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> r = restTemplate.postForObject(ANTHROPIC_URL, entity, Map.class);
            response = r;
        } catch (HttpClientErrorException e) {
            String msg = e.getStatusCode().value() == 400 && e.getResponseBodyAsString().contains("credit")
                    ? "AI 서비스 크레딧이 부족합니다. 잠시 후 다시 시도해주세요."
                    : "AI 서비스 오류: " + e.getMessage();
            throw new RuntimeException(msg, e);
        }

        if (response == null) throw new RuntimeException("No response from Anthropic");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
        String text = (String) content.get(0).get("text");

        return new ChatResponse(text);
    }
}
