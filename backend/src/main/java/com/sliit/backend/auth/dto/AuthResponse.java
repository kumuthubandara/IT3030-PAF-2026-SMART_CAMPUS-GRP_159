package com.sliit.backend.auth.dto;

public class AuthResponse {
    private String name;
    private String email;
    private String role;
    private String authProvider;

    public AuthResponse(String name, String email, String role, String authProvider) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.authProvider = authProvider;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getAuthProvider() {
        return authProvider;
    }
}
