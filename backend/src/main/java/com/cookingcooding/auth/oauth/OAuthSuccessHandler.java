package com.cookingcooding.auth.oauth;

import com.cookingcooding.auth.entity.User;
import com.cookingcooding.auth.repository.UserRepository;
import com.cookingcooding.config.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Value("${family.emails:}")
    private String familyEmails;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String nickname = oAuth2User.getAttribute("nickname");
        String provider = oAuth2User.getAttribute("provider");

        List<String> allowed = Arrays.stream(familyEmails.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        if (email == null || email.isEmpty() || !allowed.contains(email)) {
            getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/login?error=unauthorized");
            return;
        }

        User.Provider providerEnum = "kakao".equals(provider) ? User.Provider.KAKAO : User.Provider.GOOGLE;
        userRepository.findByEmail(email).orElseGet(() ->
            userRepository.save(User.builder()
                .email(email)
                .password(null)
                .nickname(nickname != null ? nickname : email)
                .role(User.Role.USER)
                .provider(providerEnum)
                .build())
        );

        String token = jwtUtil.generate(email);
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/auth/callback?token=" + token);
    }
}
