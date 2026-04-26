package com.cookingcooding.config;

import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    private static final Map<String, String> DISPLAY_NAMES = Map.of(
            "namubal78@gmail.com", "은새아빠",
            "1993jhk@gmail.com",   "은새엄마"
    );

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) return false;

        // 브라우저 WebSocket API는 HTTP Upgrade 요청에 커스텀 헤더를 설정할 수 없다.
        // 따라서 JWT를 Authorization 헤더 대신 ?token= 쿼리 파라미터로 전달받는다.
        String token = servletRequest.getServletRequest().getParameter("token");
        if (token == null || token.isBlank()) return false;

        if (!jwtUtil.isValid(token)) return false;

        String email = jwtUtil.extractEmail(token);
        String name  = DISPLAY_NAMES.getOrDefault(email, email);
        // 검증된 사용자 정보를 세션 attributes에 저장해두면 이후 STOMP 핸들러에서
        // SimpMessageHeaderAccessor로 꺼내 쓸 수 있다. HTTP 세션과는 별개의 WS 세션 범위다.
        attributes.put("email", email);
        attributes.put("name",  name);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {}
}
