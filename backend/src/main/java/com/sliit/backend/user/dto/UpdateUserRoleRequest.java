package com.sliit.backend.user.dto;

import com.sliit.backend.auth.UserRole;
import jakarta.validation.constraints.NotNull;

public class UpdateUserRoleRequest {
    @NotNull
    private UserRole role;

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}
