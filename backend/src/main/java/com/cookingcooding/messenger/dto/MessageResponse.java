package com.cookingcooding.messenger.dto;

import com.cookingcooding.messenger.entity.Message;

public record MessageResponse(
        Long id,
        String senderEmail,
        String senderName,
        String content,
        String createdAt
) {
    public static MessageResponse of(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getSenderEmail(),
                m.getSenderName(),
                m.getContent(),
                m.getCreatedAt().toString()
        );
    }
}
