package com.sliit.backend.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {
    @Value("${app.frontend.oauth-success-url:http://localhost:5173/login}")
    private String frontendOAuthSuccessUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendOAuthSuccessUrl)
                .queryParam("oauth", "error")
                .queryParam("message", "Google sign-in failed. Check OAuth client settings.")
                .build()
                .toUriString();
        response.sendRedirect(redirectUrl);
    }
}
