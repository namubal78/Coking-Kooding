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
import java.time.OffsetDateTime;
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
        LocalDate logDate = parseLogDate(req.timestamp());
        LocalDateTime now = LocalDateTime.now();

        devLogRepository.findByLogDate(logDate).ifPresentOrElse(log -> {
            int commitCount = countCommits(log.getContent()) + 1;
            log.setTitle(logDate + " 개발 일지 (" + commitCount + "건)");
            log.setContent(log.getContent() + "\n\n---\n\n" + summary);
            log.setUpdatedAt(now);
            devLogRepository.save(log);
        }, () -> {
            DevLog log = DevLog.builder()
                    .logDate(logDate)
                    .title(logDate + " 개발 일지 (1건)")
                    .content(summary)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            devLogRepository.save(log);
        });
    }

    private LocalDate parseLogDate(String timestamp) {
        if (timestamp != null && !timestamp.isBlank()) {
            try { return OffsetDateTime.parse(timestamp).toLocalDate(); } catch (Exception ignored) {}
        }
        return LocalDate.now();
    }

    private int countCommits(String content) {
        if (content == null) return 0;
        return (content.split("---", -1).length);
    }

    private static final String GITHUB_REPO = "https://github.com/namubal78/Coking-Cooding";

    private String generateSummary(DevLogWebhookRequest req) {
        String sha = req.sha() != null ? req.sha().strip() : "";
        String commitMessage = req.commitMessage() != null ? req.commitMessage().strip() : "";
        String author = req.author() != null ? req.author().strip() : "";
        String files = req.changedFiles() != null ? String.join(", ", req.changedFiles()) : "없음";
        String diff = (req.diff() != null && !req.diff().isBlank()) ? req.diff() : "diff 없음";
        String beforeAfterInstruction = buildBeforeAfterInstruction(req);

        String prompt = """
                다음 커밋 정보와 실제 코드 diff를 바탕으로 심층 기술 개발 일지를 한국어로 작성해줘.
                diff를 직접 분석해서 실제 변경 내용을 정확히 반영하고, A4 기준 1.5페이지 분량으로 압축적이고 밀도 있게 서술해줘.
                단순 설명이 아니라 "왜 이 선택인가", "어떤 대안이 있었는가", "트레이드오프는 무엇인가"를 중심으로 작성해줘.

                커밋 메시지: %s
                작성자: %s
                커밋 SHA: %s
                변경 파일: %s
                시각: %s

                실제 diff:
                ```diff
                %s
                ```

                아래 형식을 정확히 따라줘:

                ## 이슈 및 문제상황
                (왜 이 변경이 필요했는지 2~3문장. 기존 코드의 한계를 구체적으로)

                ## 커밋 요약
                (무엇을 어떻게 했는지 2~3문장. 기술적으로 구체적으로)

                ## 주요 변경사항
                - `파일명`: 변경 핵심 내용 (1~2줄)

                %s

                ## 기술 선택 배경 및 트레이드오프
                (핵심 기술 결정 1~2개만)

                ### [결정: 선택한 기술/방식]
                **선택한 이유**: (1~2문장)
                **대안**: `대안A` — 장점/단점/선택 안 한 이유 각 한 줄
                **트레이드오프**: 얻은 것과 포기한 것 각 1문장

                ## 기술 개념 심층 분석
                (핵심 키워드 2~3개)

                ### [키워드명]
                (동작 원리와 이 프로젝트에서의 적용 3~5문장)
                - **[핵심 개념]**: 1~2문장
                - **장점**: 구체적 이점 한 줄
                - **주의점**: 한계나 주의사항 한 줄

                ## 세부 설정 포인트
                - `설정항목`: 값 — 이유와 다른 값을 썼을 때 차이 한 줄

                ## 결과
                정상 처리됨 / 이슈 발생 등 한 줄
                """.formatted(commitMessage, author, sha, files, req.timestamp(), diff, beforeAfterInstruction);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 5500,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        String shaLink = "> SHA: [" + sha + "](" + GITHUB_REPO + "/commit/" + sha + ")\n\n";

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(ANTHROPIC_URL, new HttpEntity<>(body, headers), Map.class);
            if (response == null) return shaLink + "# " + commitMessage + "\n\nAI 요약 생성 실패";

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
            return shaLink + content.get(0).get("text");
        } catch (Exception e) {
            return shaLink + "## 커밋 요약\n" + req.commitMessage() + "\n\n> AI 요약 생성 실패: " + e.getMessage();
        }
    }

    private String buildBeforeAfterInstruction(DevLogWebhookRequest req) {
        List<String> files = req.changedFiles();
        if (files == null || files.isEmpty()) {
            return singleBeforeAfter();
        }

        List<String> codeFiles = files.stream()
                .filter(f -> f.endsWith(".java") || f.endsWith(".tsx") || f.endsWith(".ts")
                        || f.endsWith(".yml") || f.endsWith(".sql"))
                .limit(4)
                .toList();

        List<String> targets = codeFiles.isEmpty()
                ? files.subList(0, Math.min(3, files.size()))
                : codeFiles;

        if (targets.size() >= 3) {
            StringBuilder sb = new StringBuilder();
            for (String file : targets) {
                String filename = file.contains("/") ? file.substring(file.lastIndexOf('/') + 1) : file;
                sb.append("## BEFORE / AFTER — `").append(filename).append("`\n");
                sb.append("```before\n(diff의 - 라인을 참고해서 변경 전 핵심 코드 2~3줄)\n```\n");
                sb.append("```after\n(diff의 + 라인을 참고해서 변경 후 핵심 코드 2~3줄)\n```\n\n");
            }
            return sb.toString();
        }

        return singleBeforeAfter();
    }

    private String singleBeforeAfter() {
        return """
                ## BEFORE / AFTER
                ```before
                (diff의 - 라인을 참고해서 변경 전 핵심 코드 2~3줄)
                ```
                ```after
                (diff의 + 라인을 참고해서 변경 후 핵심 코드 2~3줄)
                ```
                """;
    }

    public void updateContent(Long id, String content) {
        DevLog log = devLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No log for id: " + id));
        log.setContent(content);
        log.setUpdatedAt(LocalDateTime.now());
        devLogRepository.save(log);
    }
}
