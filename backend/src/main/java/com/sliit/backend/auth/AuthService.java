package com.sliit.backend.auth;

import com.sliit.backend.auth.dto.AuthResponse;
import com.sliit.backend.auth.dto.LoginRequest;
import com.sliit.backend.auth.dto.SignUpRequest;
import com.sliit.backend.user.UserAccount;
import com.sliit.backend.user.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthService {
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse signUp(SignUpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userAccountRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new RuntimeException("An account already exists for this email");
        }

        UserAccount user = new UserAccount();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setRole(UserRole.USER);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setProvider("local");
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        UserAccount saved = userAccountRepository.save(user);
        return toResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new RuntimeException("This account uses social login. Please sign in with Google.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        return toResponse(user);
    }

    private AuthResponse toResponse(UserAccount user) {
        return new AuthResponse(
                user.getName(),
                user.getEmail(),
                user.getRole().name().toLowerCase(),
                user.getProvider() == null ? "local" : user.getProvider());
    }
}
