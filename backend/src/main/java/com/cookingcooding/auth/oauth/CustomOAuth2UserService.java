package com.cookingcooding.auth.oauth;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User user = super.loadUser(request);
        String provider = request.getClientRegistration().getRegistrationId();

        Map<String, Object> attrs = new HashMap<>(user.getAttributes());
        String email, nickname;

        if ("kakao".equals(provider)) {
            @SuppressWarnings("unchecked")
            Map<String, Object> kakaoAccount = (Map<String, Object>) attrs.get("kakao_account");
            email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
            @SuppressWarnings("unchecked")
            Map<String, Object> properties = (Map<String, Object>) attrs.get("properties");
            nickname = properties != null ? (String) properties.get("nickname") : email;
        } else {
            email = (String) attrs.get("email");
            nickname = (String) attrs.get("name");
        }

        attrs.put("email", email != null ? email : "");
        attrs.put("nickname", nickname);
        attrs.put("provider", provider);

        return new DefaultOAuth2User(user.getAuthorities(), attrs, "email");
    }
}
