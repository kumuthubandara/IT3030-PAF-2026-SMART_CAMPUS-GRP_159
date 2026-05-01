package com.sliit.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Warns when Google OAuth credentials are missing, placeholder, or obviously invalid.
 */
@Component
@Order(1)
@Profile("!test")
public class GoogleOAuthSetupCheck implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthSetupCheck.class);
    private static final String PLACEHOLDER = "local-google-client-id";
    /** Typical Web client ID shape from Google Cloud Console. */
    private static final Pattern GOOGLE_WEB_CLIENT_ID = Pattern.compile(
            "^[0-9]+-[A-Za-z0-9_-]+\\.apps\\.googleusercontent\\.com$");

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Override
    public void run(ApplicationArguments args) {
        String id = googleClientId == null ? "" : googleClientId.trim();
        if (id.isEmpty()
                || PLACEHOLDER.equalsIgnoreCase(id)
                || id.contains("...")
                || !GOOGLE_WEB_CLIENT_ID.matcher(id).matches()) {
            log.warn(
                    "Google OAuth2 is not configured correctly: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in "
                            + "backend/.env to the full values from Google Cloud Console → APIs & Services → "
                            + "Credentials (OAuth 2.0 Client ID, type Web application). Do not use ellipsis (...) "
                            + "or placeholder text. Authorized redirect URI must be exactly "
                            + "http://localhost:8081/login/oauth2/code/google (match backend port). "
                            + "Restart after saving .env.");
        }
    }
}
