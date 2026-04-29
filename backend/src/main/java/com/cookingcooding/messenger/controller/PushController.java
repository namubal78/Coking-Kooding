package com.cookingcooding.messenger.controller;

import com.cookingcooding.messenger.dto.PushSubscribeRequest;
import com.cookingcooding.messenger.entity.UserPushSubscription;
import com.cookingcooding.messenger.repository.PushSubscriptionRepository;
import com.cookingcooding.messenger.service.WebPushService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class PushController {

    private final WebPushService webPushService;
    private final PushSubscriptionRepository pushSubscriptionRepository;

    @GetMapping("/public-key")
    public ResponseEntity<?> publicKey() {
        String key = webPushService.getPublicKey();
        if (key == null || key.isBlank()) {
            return ResponseEntity.status(503).body(Map.of("error", "VAPID not configured"));
        }
        return ResponseEntity.ok(Map.of("publicKey", key));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody PushSubscribeRequest req, Authentication auth) {
        UserPushSubscription sub = pushSubscriptionRepository
                .findByEndpoint(req.endpoint())
                .orElseGet(() -> UserPushSubscription.builder().createdAt(LocalDateTime.now()).build());

        sub.setUserEmail(auth.getName());
        sub.setEndpoint(req.endpoint());
        sub.setP256dh(req.keys().p256dh());
        sub.setAuth(req.keys().auth());
        pushSubscriptionRepository.save(sub);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/subscribe")
    public ResponseEntity<?> unsubscribe(@RequestBody Map<String, String> body) {
        String endpoint = body.get("endpoint");
        if (endpoint != null) {
            pushSubscriptionRepository.findByEndpoint(endpoint)
                    .ifPresent(pushSubscriptionRepository::delete);
        }
        return ResponseEntity.ok().build();
    }
}
