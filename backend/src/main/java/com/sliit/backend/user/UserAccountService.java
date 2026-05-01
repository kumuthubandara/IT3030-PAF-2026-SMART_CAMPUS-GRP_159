package com.sliit.backend.user;

import com.sliit.backend.auth.UserRole;
import com.sliit.backend.notification.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserAccountService {
    private final UserAccountRepository userAccountRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.auth.auto-approve-emails:}")
    private String autoApproveEmailsCsv;

    public UserAccountService(
            UserAccountRepository userAccountRepository,
            NotificationService notificationService,
            @Lazy PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Creates an active local account immediately (no pending approval). Used by administrators only.
     */
    public UserAccount createUserByAdmin(String name, String email, String plainPassword, UserRole role) {
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        if (userAccountRepository.findByEmailIgnoreCase(normalized).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already exists for this email");
        }
        UserAccount user = new UserAccount();
        user.setName(name.trim());
        user.setEmail(normalized);
        user.setRole(role);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setProvider("local");
        user.setPasswordHash(passwordEncoder.encode(plainPassword));
        Instant now = Instant.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        return userAccountRepository.save(user);
    }

    public UserAccount findOrCreateOAuthUser(Map<String, Object> attributes, String provider) {
        String email = resolveOAuthEmail(attributes);
        if (email.isBlank()) {
            throw new RuntimeException("OAuth email is required (add email scope or preferred_username from IdP)");
        }
        String name = resolveOAuthDisplayName(attributes, email);
        String providerId = String.valueOf(attributes.getOrDefault("sub", ""));

        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            UserAccount created = new UserAccount();
            created.setEmail(email);
            created.setRole(UserRole.STUDENT);
            AccountStatus status = isAutoApproveEmail(email) ? AccountStatus.ACTIVE : AccountStatus.PENDING;
            created.setAccountStatus(status);
            created.setCreatedAt(Instant.now());
            return created;
        });
        user.setName(name);
        user.setProvider(provider);
        user.setProviderId(providerId);
        user.setPasswordHash(null);
        user.setUpdatedAt(Instant.now());
        return userAccountRepository.save(user);
    }

    private boolean isAutoApproveEmail(String email) {
        if (autoApproveEmailsCsv == null || autoApproveEmailsCsv.isBlank()) {
            return false;
        }
        String e = email.trim().toLowerCase(Locale.ROOT);
        for (String part : autoApproveEmailsCsv.split(",")) {
            if (!part.isBlank() && e.equals(part.trim().toLowerCase(Locale.ROOT))) {
                return true;
            }
        }
        return false;
    }

    /**
     * Google OIDC exposes {@code email}; Microsoft often uses {@code preferred_username} (UPN) when email is absent.
     */
    private static String resolveOAuthEmail(Map<String, Object> attributes) {
        String fromEmail = stringAttr(attributes, "email");
        if (!fromEmail.isBlank() && fromEmail.contains("@")) {
            return fromEmail.trim().toLowerCase(Locale.ROOT);
        }
        String preferred = stringAttr(attributes, "preferred_username");
        if (!preferred.isBlank() && preferred.contains("@")) {
            return preferred.trim().toLowerCase(Locale.ROOT);
        }
        return "";
    }

    private static String resolveOAuthDisplayName(Map<String, Object> attributes, String fallbackEmail) {
        String name = stringAttr(attributes, "name");
        if (!name.isBlank()) {
            return name;
        }
        String given = stringAttr(attributes, "given_name");
        String family = stringAttr(attributes, "family_name");
        if (!given.isBlank() || !family.isBlank()) {
            return (given + " " + family).trim();
        }
        String display = stringAttr(attributes, "displayName");
        if (!display.isBlank()) {
            return display;
        }
        int at = fallbackEmail.indexOf('@');
        return at > 0 ? fallbackEmail.substring(0, at) : fallbackEmail;
    }

    private static String stringAttr(Map<String, Object> attributes, String key) {
        Object v = attributes.get(key);
        if (v == null) {
            return "";
        }
        String s = String.valueOf(v).trim();
        return "null".equalsIgnoreCase(s) ? "" : s;
    }

    public List<UserAccount> getAllUsers() {
        return userAccountRepository.findAll();
    }

    public List<UserAccount> findPendingRegistrations() {
        return userAccountRepository.findByAccountStatus(AccountStatus.PENDING);
    }

    public UserAccount approveRegistration(String email) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        if (user.getAccountStatus() != AccountStatus.PENDING) {
            throw new RuntimeException("This account is not awaiting approval.");
        }
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setUpdatedAt(Instant.now());
        UserAccount updated = userAccountRepository.save(user);
        notificationService.createSystemNotification(
                updated.getEmail(),
                "ACCOUNT_APPROVED",
                "Account approved",
                "Your Smart Campus account is approved. You can sign in now.",
                updated.getId());
        return updated;
    }

    public void rejectPendingRegistration(String email) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        if (user.getAccountStatus() != AccountStatus.PENDING) {
            throw new RuntimeException("Only pending registrations can be removed this way.");
        }
        userAccountRepository.delete(user);
    }

    public UserAccount updateRole(String email, UserRole role) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        UserRole previousRole = user.getRole();
        user.setRole(role);
        user.setUpdatedAt(Instant.now());
        UserAccount updated = userAccountRepository.save(user);
        notificationService.createSystemNotification(
                updated.getEmail(),
                "ROLE_UPDATE",
                "Account role updated",
                "Your role changed from "
                        + (previousRole == null ? "unknown" : previousRole.name())
                        + " to "
                        + role.name()
                        + ".",
                updated.getId());
        return updated;
    }

    public NotificationPreferences getEffectiveNotificationPreferences(String email) {
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        UserAccount user = userAccountRepository
                .findByEmailIgnoreCase(normalized)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        NotificationPreferences stored = user.getNotificationPreferences();
        if (stored == null) {
            return new NotificationPreferences();
        }
        return copyPreferences(stored);
    }

    public NotificationPreferences updateNotificationPreferences(String email, NotificationPreferences prefs) {
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        UserAccount user = userAccountRepository
                .findByEmailIgnoreCase(normalized)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setNotificationPreferences(copyPreferences(prefs));
        user.setUpdatedAt(Instant.now());
        userAccountRepository.save(user);
        return copyPreferences(prefs);
    }

    private static NotificationPreferences copyPreferences(NotificationPreferences src) {
        NotificationPreferences p = new NotificationPreferences();
        p.setBookingUpdates(src.isBookingUpdates());
        p.setTicketStatusUpdates(src.isTicketStatusUpdates());
        p.setTicketCommentUpdates(src.isTicketCommentUpdates());
        p.setAccountUpdates(src.isAccountUpdates());
        return p;
    }
}
