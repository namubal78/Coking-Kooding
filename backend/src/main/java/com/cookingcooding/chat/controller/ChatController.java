package com.cookingcooding.chat.controller;

import com.cookingcooding.chat.dto.ChatRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest req) {
        return ResponseEntity.status(503).body(Map.of("error", "AI 챗봇 서비스가 일시 중단되었습니다."));
    }
}
