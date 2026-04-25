package com.cookingcooding.messenger.controller;

import com.cookingcooding.messenger.dto.MessagePayload;
import com.cookingcooding.messenger.dto.MessageResponse;
import com.cookingcooding.messenger.service.MessengerService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MessengerController {

    private final MessengerService messengerService;

    // ── REST: 최근 50개 메시지 이력 ─────────────────────────────────
    @GetMapping("/api/messenger/history")
    public List<MessageResponse> history() {
        return messengerService.getHistory();
    }

    // ── STOMP: 메시지 수신 → 저장 → 전체 브로드캐스트 ─────────────
    @MessageMapping("/chat.send")
    @SendTo("/topic/messages")
    public MessageResponse send(MessagePayload payload, SimpMessageHeaderAccessor accessor) {
        Map<String, Object> attrs = accessor.getSessionAttributes();
        if (attrs == null) throw new IllegalStateException("Unauthorized");

        String email = (String) attrs.get("email");
        String name  = (String) attrs.get("name");
        if (email == null || payload.content() == null || payload.content().isBlank()) {
            throw new IllegalArgumentException("Invalid message");
        }

        return messengerService.save(email, name, payload.content());
    }
}
