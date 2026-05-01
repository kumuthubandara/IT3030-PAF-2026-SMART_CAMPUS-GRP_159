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
 * Logs a clear warning when Microsoft OAuth is still using a placeholder or invalid client id.
 */
@Component
@Order(0)
@Profile("!test")
public class MicrosoftOAuthSetupCheck implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(MicrosoftOAuthSetupCheck.class);
    private static final String PLACEHOLDER = "local-microsoft-client-id";
    private static final Pattern AZURE_CLIENT_ID_GUID = Pattern.compile(
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

    @Value("${spring.security.oauth2.client.registration.microsoft.client-id:}")
    private String microsoftClientId;

    @Override
    public void run(ApplicationArguments args) {
        String id = microsoftClientId == null ? "" : microsoftClientId.trim();
        if (id.isEmpty() || PLACEHOLDER.equalsIgnoreCase(id) || !AZURE_CLIENT_ID_GUID.matcher(id).matches()) {
            log.warn(
                    "Microsoft OAuth2 is not configured: MICROSOFT_CLIENT_ID must be the Azure Application "
                            + "(client) ID (UUID), in backend/.env — not English placeholder text. Restart after "
                            + "saving. Register redirect URI http://localhost:8081/login/oauth2/code/microsoft. "
                            + "For @outlook.com sign-in, use app type \"any org directory + personal Microsoft accounts\".");
        }
    }
}
