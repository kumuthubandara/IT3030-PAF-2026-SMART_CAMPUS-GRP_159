package com.sliit.backend.user;

import com.sliit.backend.auth.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Optional;

/**
 * Ensures a first campus administrator exists when bootstrap email/password are configured
 * (see {@code app.bootstrap.admin-email} / {@code BOOTSTRAP_ADMIN_EMAIL} in {@code backend/.env}).
 * If the email already exists as {@link AccountStatus#PENDING}, that account is promoted to
 * ACTIVE {@link UserRole#ADMINISTRATOR}.
 */
@Component
@Order(100)
public class AdministratorBootstrap implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AdministratorBootstrap.class);

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public AdministratorBootstrap(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            Environment environment) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = firstNonBlank(
                environment.getProperty("app.bootstrap.admin-email"),
                environment.getProperty("BOOTSTRAP_ADMIN_EMAIL"));
        String password = firstNonBlank(
                environment.getProperty("app.bootstrap.admin-password"),
                environment.getProperty("BOOTSTRAP_ADMIN_PASSWORD"));
        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            log.debug("Bootstrap administrator not configured (set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in backend/.env).");
            return;
        }
        email = email.trim().toLowerCase();

        boolean anyActiveAdmin = userAccountRepository.findByRole(UserRole.ADMINISTRATOR).stream()
                .anyMatch(UserAccount::canLogin);
        if (anyActiveAdmin) {
            return;
        }

        Optional<UserAccount> existingOpt = userAccountRepository.findByEmailIgnoreCase(email);
        if (existingOpt.isPresent()) {
            UserAccount existing = existingOpt.get();
            if (existing.getAccountStatus() == AccountStatus.PENDING) {
                existing.setRole(UserRole.ADMINISTRATOR);
                existing.setAccountStatus(AccountStatus.ACTIVE);
                existing.setPasswordHash(passwordEncoder.encode(password));
                existing.setProvider("local");
                if (existing.getName() == null || existing.getName().isBlank()) {
                    existing.setName("Campus Administrator");
                }
                existing.setUpdatedAt(Instant.now());
                userAccountRepository.save(existing);
                log.info(
                        "Promoted pending account {} to ACTIVE administrator (bootstrap). Remove BOOTSTRAP_ADMIN_PASSWORD from .env after use.",
                        email);
                return;
            }
            log.warn(
                    "Bootstrap admin email {} is already registered with a non-pending account; skipping bootstrap.",
                    email);
            return;
        }

        UserAccount admin = new UserAccount();
        admin.setEmail(email);
        admin.setName("Campus Administrator");
        admin.setRole(UserRole.ADMINISTRATOR);
        admin.setAccountStatus(AccountStatus.ACTIVE);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setProvider("local");
        admin.setCreatedAt(Instant.now());
        admin.setUpdatedAt(Instant.now());
        userAccountRepository.save(admin);
        log.info(
                "Created initial administrator account for {} (remove BOOTSTRAP_ADMIN_PASSWORD from .env after use).",
                email);
    }

    private static String firstNonBlank(String a, String b) {
        if (StringUtils.hasText(a)) {
            return a.trim();
        }
        if (StringUtils.hasText(b)) {
            return b.trim();
        }
        return "";
    }
}
