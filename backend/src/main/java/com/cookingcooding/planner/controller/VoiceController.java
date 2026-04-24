package com.cookingcooding.planner.controller;

import com.cookingcooding.planner.dto.VoiceParseRequest;
import com.cookingcooding.planner.dto.VoiceParseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/planner")
@RequiredArgsConstructor
public class VoiceController {

    @Value("${anthropic.api-key:}")
    private String apiKey;

    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/voice")
    public ResponseEntity<VoiceParseResponse> parseVoice(@RequestBody VoiceParseRequest req) {
        String prompt = """
                오늘 날짜: %s

                아래 음성 입력을 파싱해서 일정 정보를 JSON으로만 반환해줘. 설명이나 다른 텍스트 없이 JSON만.

                음성: "%s"

                반환 형식:
                {"title":"일정 제목","date":"YYYY-MM-DD","description":"부가 설명 (없으면 빈 문자열)"}

                규칙:
                - date는 오늘 기준으로 계산. YYYY-MM-DD 형식 필수
                - "오늘"→오늘, "내일"→내일, "모레"→모레, "다음주 월요일" 등 자연어 날짜 계산
                - title은 핵심 내용만 간결하게 (조사 제거)
                - 시간 정보는 description에 포함
                - 날짜를 특정할 수 없으면 오늘 날짜 사용
                """.formatted(req.today(), req.text());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 256,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    ANTHROPIC_URL, new HttpEntity<>(body, headers), Map.class);
            if (response == null) return ResponseEntity.internalServerError().build();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
            String text = content.get(0).get("text").toString().trim();

            // JSON 블록 추출
            Matcher m = Pattern.compile("\\{[^}]+\\}").matcher(text);
            if (!m.find()) return ResponseEntity.internalServerError().build();

            String json = m.group();
            String title = extract(json, "title");
            String date = extract(json, "date");
            String description = extract(json, "description");

            return ResponseEntity.ok(new VoiceParseResponse(title, date, description));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String extract(String json, String key) {
        Matcher m = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
        return m.find() ? m.group(1) : "";
    }
}
