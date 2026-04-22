package com.cookingcooding.devlog.service;

import com.cookingcooding.devlog.dto.DevLogResponse;
import com.cookingcooding.devlog.dto.DevLogWebhookRequest;
import com.cookingcooding.devlog.entity.DevLog;
import com.cookingcooding.devlog.repository.DevLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DevLogService {

    @Value("${anthropic.api-key:}")
    private String apiKey;

    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";

    private final DevLogRepository devLogRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public List<DevLogResponse> getAll() {
        return devLogRepository.findAllByOrderByLogDateDesc().stream()
                .map(DevLogResponse::of)
                .toList();
    }

    public DevLogResponse getByDate(LocalDate date) {
        return devLogRepository.findByLogDate(date)
                .map(DevLogResponse::of)
                .orElseThrow(() -> new IllegalArgumentException("No log for date: " + date));
    }

    public void receiveCommit(DevLogWebhookRequest req) {
        String summary = generateSummary(req);
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        devLogRepository.findByLogDate(today).ifPresentOrElse(log -> {
            int commitCount = countCommits(log.getContent()) + 1;
            log.setTitle(today + " 개발 일지 (" + commitCount + "건)");
            log.setContent(log.getContent() + "\n\n---\n\n" + summary);
            log.setUpdatedAt(now);
            devLogRepository.save(log);
        }, () -> {
            DevLog log = DevLog.builder()
                    .logDate(today)
                    .title(today + " 개발 일지 (1건)")
                    .content(summary)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            devLogRepository.save(log);
        });
    }

    private int countCommits(String content) {
        if (content == null) return 0;
        return (content.split("---", -1).length);
    }

    private String generateSummary(DevLogWebhookRequest req) {
        String files = req.changedFiles() != null ? String.join(", ", req.changedFiles()) : "없음";
        String prompt = """
                다음 커밋 정보를 바탕으로 개발 작업 초록을 한국어로 작성해줘.

                커밋 메시지: %s
                작성자: %s
                커밋 SHA: %s
                변경 파일: %s
                시각: %s

                아래 형식으로 작성해줘:

                ## 커밋 요약
                (무엇을 했는지 1~2문장)

                ## 주요 변경사항
                (변경 파일별 핵심 내용, 각 파일 한 줄씩)

                ## 기술 개념 설명
                (이 커밋에서 등장한 기술 키워드 2~4개를 골라 각각 2~3문장으로 쉽게 설명)

                ## 결과
                정상 처리됨 / 이슈 발생 등 한 줄로 작성
                """.formatted(req.commitMessage(), req.author(), req.sha(), files, req.timestamp());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 1024,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(ANTHROPIC_URL, new HttpEntity<>(body, headers), Map.class);
            if (response == null) return "# " + req.commitMessage() + "\n\nAI 요약 생성 실패";

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
            return (String) content.get(0).get("text");
        } catch (Exception e) {
            return "## 커밋 요약\n" + req.commitMessage() + "\n\n> AI 요약 생성 실패: " + e.getMessage();
        }
    }
}
