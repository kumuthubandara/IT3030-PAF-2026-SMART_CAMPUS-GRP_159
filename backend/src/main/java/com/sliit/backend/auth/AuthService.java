package com.sliit.backend.auth;

import com.sliit.backend.auth.dto.AuthResponse;
import com.sliit.backend.auth.dto.LoginRequest;
import com.sliit.backend.auth.dto.SignUpRequest;
import com.sliit.backend.notification.NotificationService;
import com.sliit.backend.user.AccountStatus;
import com.sliit.backend.user.UserAccount;
import com.sliit.backend.user.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

@Service
public class AuthService {
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Value("${app.notifications.admin-email:}")
    private String fallbackAdminNotifyEmail;

    @Value("${app.auth.auto-approve-emails:}")
    private String autoApproveEmailsCsv;

    public AuthService(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            NotificationService notificationService) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    public AuthResponse signUp(SignUpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userAccountRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new RuntimeException("An account already exists for this email");
        }

        String campus = request.getCampusRole().trim().toLowerCase(Locale.ROOT);
        UserRole role = UserRole.valueOf(campus.toUpperCase(Locale.ROOT));

        AccountStatus status = isAutoApproveEmail(email) ? AccountStatus.ACTIVE : AccountStatus.PENDING;

        UserAccount user = new UserAccount();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setRole(role);
        user.setAccountStatus(status);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setProvider("local");
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        UserAccount saved = userAccountRepository.save(user);

        if (status == AccountStatus.PENDING) {
            notifyAdminsNewRegistration(saved);
        }

        return toResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.canLogin()) {
            throw new RuntimeException(
                    "Your account is waiting for administrator approval. You will be able to sign in after it is approved.");
        }

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new RuntimeException("This account uses social login. Please sign in with Google.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        return toResponse(user);
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

    private void notifyAdminsNewRegistration(UserAccount user) {
        Set<String> recipients = new LinkedHashSet<>();
        for (UserAccount admin : userAccountRepository.findByRole(UserRole.ADMINISTRATOR)) {
            if (admin.canLogin() && admin.getEmail() != null && !admin.getEmail().isBlank()) {
                recipients.add(admin.getEmail().trim().toLowerCase(Locale.ROOT));
            }
        }
        if (fallbackAdminNotifyEmail != null && !fallbackAdminNotifyEmail.isBlank()) {
            recipients.add(fallbackAdminNotifyEmail.trim().toLowerCase(Locale.ROOT));
        }
        if (recipients.isEmpty()) {
            return;
        }
        notificationService.notifyRecipients(
                recipients,
                "REGISTRATION_PENDING",
                "New account pending approval",
                user.getName()
                        + " ("
                        + user.getEmail()
                        + ") requested access as "
                        + user.getRole().name().toLowerCase(Locale.ROOT)
                        + ".",
                user.getId());
    }

    private AuthResponse toResponse(UserAccount user) {
        return new AuthResponse(
                user.getName(),
                user.getEmail(),
                user.getRole().name().toLowerCase(Locale.ROOT),
                user.getProvider() == null ? "local" : user.getProvider(),
                accountStatusLabel(user));
    }

    private static String accountStatusLabel(UserAccount user) {
        if (user.getAccountStatus() == null || user.getAccountStatus() == AccountStatus.ACTIVE) {
            return "active";
        }
        return user.getAccountStatus().name().toLowerCase(Locale.ROOT);
    }
}
