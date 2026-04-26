package com.cookingcooding.config;

import com.cookingcooding.auth.oauth.CustomOAuth2UserService;
import com.cookingcooding.auth.oauth.OAuthFailureHandler;
import com.cookingcooding.auth.oauth.OAuthSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuthSuccessHandler oAuthSuccessHandler;
    private final OAuthFailureHandler oAuthFailureHandler;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // CSRF: JWT 기반 Stateless API이므로 비활성화. 세션 쿠키를 사용하지 않아 CSRF 공격 벡터가 없다.
            .csrf(csrf -> csrf.disable())
            // IF_REQUIRED: OAuth2 로그인 콜백에서 Spring Security가 임시 세션을 생성해야 하므로 STATELESS 대신 사용.
            // JWT API 요청은 세션을 생성하지 않고, 세션은 OAuth 흐름 완료 후 즉시 무효화된다.
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                // OPTIONS preflight를 먼저 허용하지 않으면 CORS 협상 자체가 막혀 모든 요청이 실패한다.
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/health").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                .requestMatchers("/api/blog/posts").permitAll()
                .requestMatchers("/api/blog/posts/{id}").permitAll()
                .requestMatchers("/api/chat").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/files", "/api/files/extensions").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/payments").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/photos/storage").permitAll()
                // webhook/admin 엔드포인트는 JWT 대신 X-Webhook-Secret 헤더로 자체 인증하므로 Security는 통과시킨다.
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/dev-logs/webhook").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/dev-logs/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/slack/events").permitAll()
                // /ws/** 허용: SockJS는 WebSocket 업그레이드 전 HTTP GET /ws/info 등을 먼저 요청한다.
                // 이 경로를 막으면 핸드셰이크 자체가 시작되지 않는다. 실제 인증은 JwtHandshakeInterceptor가 담당.
                .requestMatchers("/ws/**").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized\"}");
                })
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(ui -> ui.userService(customOAuth2UserService))
                .successHandler(oAuthSuccessHandler)
                .failureHandler(oAuthFailureHandler)
            )
            .addFilterBefore(new JwtFilter(jwtUtil, userDetailsService),
                    UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
