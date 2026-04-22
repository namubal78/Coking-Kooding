package com.cookingcooding.chat.controller;

import com.cookingcooding.chat.dto.ChatRequest;
import com.cookingcooding.chat.dto.ChatResponse;
import com.cookingcooding.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest req) {
        return ResponseEntity.ok(chatService.chat(req));
    }
}
