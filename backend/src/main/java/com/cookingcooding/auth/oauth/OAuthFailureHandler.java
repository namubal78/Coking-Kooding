package com.cookingcooding.auth.oauth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

@Slf4j
@Component
public class OAuthFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException {
        String cookies = request.getCookies() == null ? "none"
                : Arrays.stream(request.getCookies()).map(Cookie::getName).collect(Collectors.joining(", "));
        log.error("[OAuth Failure] cause={} | UA={} | cookies=[{}]",
                exception.getMessage(), request.getHeader("User-Agent"), cookies, exception);
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/login?error=oauth_failed");
    }
}
