package com.sliit.backend.config;

import com.sliit.backend.user.UserAccount;
import com.sliit.backend.user.UserAccountService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private final UserAccountService userAccountService;

    @Value("${app.frontend.oauth-success-url:http://localhost:5173/login}")
    private String frontendOAuthSuccessUrl;

    public OAuth2LoginSuccessHandler(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User principal = oauthToken.getPrincipal();
        UserAccount user = userAccountService.findOrCreateOAuthUser(
                principal.getAttributes(),
                oauthToken.getAuthorizedClientRegistrationId());

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendOAuthSuccessUrl)
                .queryParam("oauth", "success")
                .queryParam("email", user.getEmail())
                .queryParam("name", user.getName())
                .queryParam("role", user.getRole().name().toLowerCase())
                .build()
                .toUriString();
        response.sendRedirect(redirectUrl);
    }
}
