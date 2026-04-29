package com.cookingcooding.messenger.service;

import com.cookingcooding.messenger.entity.UserPushSubscription;
import com.cookingcooding.messenger.repository.PushSubscriptionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Security;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebPushService {

    @Value("${vapid.public-key:}")
    private String publicKey;

    @Value("${vapid.private-key:}")
    private String privateKey;

    @Value("${vapid.subject:mailto:namubal78@gmail.com}")
    private String subject;

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final ObjectMapper objectMapper;

    private PushService pushService;

    @PostConstruct
    public void init() {
        if (publicKey.isBlank() || privateKey.isBlank()) {
            log.warn("VAPID 키 미설정 — 웹 푸시 비활성화. Render 환경변수에 VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY 추가 필요.");
            return;
        }
        try {
            Security.addProvider(new BouncyCastleProvider());
            pushService = new PushService(publicKey, privateKey, subject);
            log.info("웹 푸시 서비스 초기화 완료");
        } catch (Exception e) {
            log.error("웹 푸시 초기화 실패: {}", e.getMessage());
        }
    }

    public String getPublicKey() { return publicKey; }

    public boolean isEnabled() { return pushService != null; }

    public void sendToOthers(String senderEmail, String senderName, String messagePreview) {
        if (!isEnabled()) return;

        List<UserPushSubscription> subs = pushSubscriptionRepository.findByUserEmailNot(senderEmail);
        if (subs.isEmpty()) return;

        String payload;
        try {
            String preview = messagePreview != null && messagePreview.length() > 60
                    ? messagePreview.substring(0, 60) + "…"
                    : messagePreview;
            payload = objectMapper.writeValueAsString(Map.of(
                    "title", "은새네 가족 채팅",
                    "body", senderName + ": " + (preview != null ? preview : "📷 사진")
            ));
        } catch (Exception e) {
            log.error("푸시 페이로드 생성 실패: {}", e.getMessage());
            return;
        }

        for (UserPushSubscription sub : subs) {
            try {
                Notification notification = new Notification(
                        sub.getEndpoint(),
                        sub.getP256dh(),
                        sub.getAuth(),
                        payload.getBytes(StandardCharsets.UTF_8)
                );
                HttpResponse response = pushService.send(notification);
                int status = response.getStatusLine().getStatusCode();
                if (status == 410 || status == 404) {
                    pushSubscriptionRepository.delete(sub);
                    log.info("만료된 푸시 구독 삭제: {}", sub.getUserEmail());
                }
            } catch (Exception e) {
                log.warn("푸시 전송 실패 ({}): {}", sub.getUserEmail(), e.getMessage());
            }
        }
    }
}
