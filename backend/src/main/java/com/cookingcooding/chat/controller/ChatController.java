package com.cookingcooding.chat.controller;

import com.cookingcooding.chat.dto.ChatRequest;
import com.cookingcooding.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest req) {
        try {
            return ResponseEntity.ok(chatService.chat(req));
        } catch (RuntimeException e) {
            return ResponseEntity.status(503).body(Map.of("error", e.getMessage()));
        }
    }
}
