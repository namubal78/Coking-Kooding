package com.cookingcooding.messenger.controller;

import com.cookingcooding.messenger.dto.*;
import com.cookingcooding.messenger.service.MessengerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MessengerController {

    private final MessengerService messengerService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/api/messenger/history")
    public MessengerHistoryResponse history() {
        return messengerService.getHistory();
    }

    @PostMapping("/api/messenger/read")
    public ResponseEntity<?> markRead(@RequestBody Map<String, Long> body, Authentication auth) {
        Long lastId = body.get("lastId");
        if (lastId == null) return ResponseEntity.badRequest().build();
        ReadPayload payload = messengerService.markRead(auth.getName(), lastId);
        messagingTemplate.convertAndSend("/topic/reads", payload);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/messenger/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        try {
            String url = messengerService.uploadImage(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/messenger/unread")
    public ResponseEntity<?> unread(Authentication auth) {
        long count = messengerService.getUnreadCount(auth.getName());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/messages")
    public MessageResponse send(MessagePayload payload, SimpMessageHeaderAccessor accessor) {
        Map<String, Object> attrs = accessor.getSessionAttributes();
        if (attrs == null) throw new IllegalStateException("Unauthorized");

        String email = (String) attrs.get("email");
        String name  = (String) attrs.get("name");

        boolean hasContent = payload.content() != null && !payload.content().isBlank();
        boolean hasImage   = payload.imageUrl() != null && !payload.imageUrl().isBlank();
        if (email == null || (!hasContent && !hasImage)) {
            throw new IllegalArgumentException("Invalid message");
        }

        return messengerService.save(email, name, payload.content(), payload.imageUrl());
    }
}
