package com.cookingcooding.devlog.controller;

import com.cookingcooding.devlog.dto.DevLogResponse;
import com.cookingcooding.devlog.dto.DevLogWebhookRequest;
import com.cookingcooding.devlog.service.DevLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dev-logs")
@RequiredArgsConstructor
public class DevLogController {

    @Value("${webhook.secret:}")
    private String webhookSecret;

    private final DevLogService devLogService;

    @GetMapping
    public List<DevLogResponse> getAll() {
        return devLogService.getAll();
    }

    @GetMapping("/{date}")
    public DevLogResponse getByDate(@PathVariable String date) {
        return devLogService.getByDate(LocalDate.parse(date));
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(
            @RequestHeader(value = "X-Webhook-Secret", required = false) String secret,
            @RequestBody DevLogWebhookRequest req
    ) {
        if (webhookSecret.isBlank() || !webhookSecret.equals(secret)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        devLogService.receiveCommit(req);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateContent(
            @PathVariable Long id,
            @RequestHeader(value = "X-Webhook-Secret", required = false) String secret,
            @RequestBody Map<String, String> body
    ) {
        if (webhookSecret.isBlank() || !webhookSecret.equals(secret)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        devLogService.updateContent(id, body.get("content"));
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
