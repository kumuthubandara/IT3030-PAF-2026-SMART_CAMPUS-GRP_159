package com.sliit.backend.user;

import com.sliit.backend.auth.UserRole;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class UserAccountService {
    private final UserAccountRepository userAccountRepository;

    public UserAccountService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
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
            created.setRole(UserRole.USER);
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

    public List<UserAccount> getAllUsers() {
        return userAccountRepository.findAll();
    }

    public UserAccount updateRole(String email, UserRole role) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        user.setRole(role);
        user.setUpdatedAt(Instant.now());
        return userAccountRepository.save(user);
    }
}
