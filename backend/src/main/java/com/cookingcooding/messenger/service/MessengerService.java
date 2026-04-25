package com.cookingcooding.messenger.service;

import com.cookingcooding.messenger.dto.MessageResponse;
import com.cookingcooding.messenger.entity.Message;
import com.cookingcooding.messenger.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessengerService {

    private final MessageRepository messageRepository;

    public List<MessageResponse> getHistory() {
        return messageRepository.findTop50ByOrderByCreatedAtAsc()
                .stream().map(MessageResponse::of).toList();
    }

    public MessageResponse save(String email, String name, String content) {
        Message message = Message.builder()
                .senderEmail(email)
                .senderName(name)
                .content(content.strip())
                .createdAt(LocalDateTime.now())
                .build();
        return MessageResponse.of(messageRepository.save(message));
    }
}
