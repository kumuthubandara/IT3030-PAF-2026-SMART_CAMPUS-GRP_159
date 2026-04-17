package com.sliit.backend.auth.dto;

public class AuthResponse {
    private String name;
    private String email;
    private String role;
    private String authProvider;
    /** "active" or "pending" — pending accounts cannot sign in until an administrator approves. */
    private String accountStatus;

    public AuthResponse(String name, String email, String role, String authProvider, String accountStatus) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.authProvider = authProvider;
        this.accountStatus = accountStatus;
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

    public String getAccountStatus() {
        return accountStatus;
    }
}
