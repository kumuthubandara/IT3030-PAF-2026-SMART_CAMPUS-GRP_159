package com.sliit.backend.user;

import com.sliit.backend.auth.UserRole;
import com.sliit.backend.notification.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserAccountService {
    private final UserAccountRepository userAccountRepository;
    private final NotificationService notificationService;

    @Value("${app.auth.auto-approve-emails:}")
    private String autoApproveEmailsCsv;

    public UserAccountService(
            UserAccountRepository userAccountRepository,
            NotificationService notificationService) {
        this.userAccountRepository = userAccountRepository;
        this.notificationService = notificationService;
    }

    public UserAccount findOrCreateOAuthUser(Map<String, Object> attributes, String provider) {
        String email = String.valueOf(attributes.getOrDefault("email", "")).trim().toLowerCase();
        if (email.isBlank()) {
            throw new RuntimeException("OAuth email is required");
        }
        String name = String.valueOf(attributes.getOrDefault("name", email));
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
}
