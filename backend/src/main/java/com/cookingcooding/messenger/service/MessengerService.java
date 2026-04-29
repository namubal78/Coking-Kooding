package com.cookingcooding.messenger.service;

import com.cookingcooding.messenger.dto.*;
import com.cookingcooding.messenger.entity.Message;
import com.cookingcooding.messenger.entity.MessageRead;
import com.cookingcooding.messenger.repository.MessageReadRepository;
import com.cookingcooding.messenger.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessengerService {

    private final MessageRepository messageRepository;
    private final MessageReadRepository messageReadRepository;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-key:}")
    private String serviceKey;

    @Value("${supabase.bucket:photos}")
    private String bucket;

    private final RestTemplate restTemplate = new RestTemplate();

    public MessengerHistoryResponse getHistory() {
        List<MessageResponse> messages = messageRepository.findTop50ByOrderByCreatedAtAsc()
                .stream().map(MessageResponse::of).toList();
        Map<String, Long> reads = messageReadRepository.findAll().stream()
                .collect(Collectors.toMap(MessageRead::getUserEmail, MessageRead::getLastReadId));
        return new MessengerHistoryResponse(messages, reads);
    }

    public MessageResponse save(String email, String name, String content, String imageUrl) {
        Message message = Message.builder()
                .senderEmail(email)
                .senderName(name)
                .content(content != null && !content.isBlank() ? content.strip() : null)
                .imageUrl(imageUrl)
                .createdAt(LocalDateTime.now())
                .build();
        return MessageResponse.of(messageRepository.save(message));
    }

    public ReadPayload markRead(String email, Long lastId) {
        MessageRead read = messageReadRepository.findById(email)
                .orElseGet(() -> MessageRead.builder().userEmail(email).lastReadId(0L).build());
        if (lastId > read.getLastReadId()) {
            read.setLastReadId(lastId);
            messageReadRepository.save(read);
        }
        return new ReadPayload(email, read.getLastReadId());
    }

    public long getUnreadCount(String email) {
        long lastReadId = messageReadRepository.findById(email)
                .map(MessageRead::getLastReadId).orElse(0L);
        return messageRepository.countByIdGreaterThan(lastReadId);
    }

    public String uploadImage(MultipartFile file) throws IOException {
        String ext = getExtension(file.getOriginalFilename());
        String path = "chat/" + UUID.randomUUID() + "." + ext;
        String url = supabaseUrl + "/storage/v1/object/" + bucket + "/" + path;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.setContentType(MediaType.parseMediaType(
                file.getContentType() != null ? file.getContentType() : "application/octet-stream"));

        restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(file.getBytes(), headers), String.class);

        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + path;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
