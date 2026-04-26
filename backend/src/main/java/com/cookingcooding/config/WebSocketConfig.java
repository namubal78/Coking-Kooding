package com.cookingcooding.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // simpleBroker: JVM 내부 인메모리 브로커. 외부 RabbitMQ/Redis 없이 동작하는 대신
        // 서버 재시작 시 구독 정보가 사라지고, 다중 인스턴스 환경에서는 메시지가 누락될 수 있다.
        config.enableSimpleBroker("/topic");
        // /app 접두사: 클라이언트가 /app/chat.send 로 보내면 @MessageMapping("/chat.send")로 라우팅된다.
        // /topic은 브로커가 직접 구독자에게 push하는 경로라 @MessageMapping 없이 subscribe만 하면 된다.
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(jwtHandshakeInterceptor)
                // SockJS: WebSocket을 지원하지 않는 환경(일부 프록시, 구형 브라우저)에서
                // HTTP long-polling 등으로 자동 폴백한다. 엔드포인트 URL은 동일하게 유지된다.
                .withSockJS();
    }
}
