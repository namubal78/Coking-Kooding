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

    private static final String GITHUB_REPO = "https://github.com/namubal78/Coking-Cooding";

    private String generateSummary(DevLogWebhookRequest req) {
        String sha = req.sha() != null ? req.sha().strip() : "";
        String commitMessage = req.commitMessage() != null ? req.commitMessage().strip() : "";
        String author = req.author() != null ? req.author().strip() : "";
        String files = req.changedFiles() != null ? String.join(", ", req.changedFiles()) : "없음";
        String diff = (req.diff() != null && !req.diff().isBlank()) ? req.diff() : "diff 없음";
        String beforeAfterInstruction = buildBeforeAfterInstruction(req);

        String prompt = """
                다음 커밋 정보와 실제 코드 diff를 바탕으로 기술 개발 일지를 한국어로 작성해줘.
                diff를 직접 분석해서 실제 코드 변경 내용을 정확히 반영해줘.

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
                (이 커밋에서 해결하려 했던 문제나 배경을 2~4문장으로. 어떤 상황에서 왜 이 변경이 필요했는지 구체적으로 서술)

                ## 커밋 요약
                (무엇을 어떻게 했는지 2~3문장. 기술적으로 구체적으로)

                ## 주요 변경사항
                (변경된 각 파일별 기술적 핵심 내용을 한 줄씩. diff를 참고해서 실제 변경 내용 기재)
                - `파일명`: 변경 내용

                %s

                ## 기술 개념 설명
                (이 커밋에서 등장한 기술 키워드 3~5개를 골라 각각 아래 형식으로 설명.
                단순 정의가 아니라 이 프로젝트에서 어떻게 적용됐는지, 왜 이 방식을 선택했는지까지 서술)

                ### 키워드명
                (이 기술이 무엇인지, 왜 필요한지, 이 커밋에서 어떻게 활용됐는지 4~6문장으로 상세히)
                - **핵심개념1**: 구체적인 설명 1~2문장
                - **핵심개념2**: 구체적인 설명 1~2문장
                - **핵심개념3**: 구체적인 설명 1~2문장

                ## 결과
                정상 처리됨 / 이슈 발생 등 한 줄로 작성
                """.formatted(commitMessage, author, sha, files, req.timestamp(), diff, beforeAfterInstruction);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 2048,
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
                sb.append("```before\n(diff의 - 라인을 참고해서 이 파일의 변경 전 핵심 코드 2~5줄)\n```\n");
                sb.append("```after\n(diff의 + 라인을 참고해서 이 파일의 변경 후 핵심 코드 2~5줄)\n```\n\n");
            }
            return sb.toString();
        }

        return singleBeforeAfter();
    }

    private String singleBeforeAfter() {
        return """
                ## BEFORE / AFTER
                ```before
                (diff의 - 라인을 참고해서 변경 전 핵심 코드 2~5줄)
                ```
                ```after
                (diff의 + 라인을 참고해서 변경 후 핵심 코드 2~5줄)
                ```
                """;
    }
}
