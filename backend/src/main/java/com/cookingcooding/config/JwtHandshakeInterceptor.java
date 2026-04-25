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

        String token = servletRequest.getServletRequest().getParameter("token");
        if (token == null || token.isBlank()) return false;

        if (!jwtUtil.isValid(token)) return false;

        String email = jwtUtil.extractEmail(token);
        String name  = DISPLAY_NAMES.getOrDefault(email, email);
        attributes.put("email", email);
        attributes.put("name",  name);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {}
}
