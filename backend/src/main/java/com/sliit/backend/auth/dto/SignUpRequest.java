package com.sliit.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SignUpRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 64)
    private String password;

    /**
     * Campus role to assign after approval. Administrator accounts cannot be self-registered.
     */
    @NotBlank
    @Pattern(regexp = "(?i)^(student|lecturer|technician)$", message = "Role must be student, lecturer, or technician")
    private String campusRole;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCampusRole() {
        return campusRole;
    }

    public void setCampusRole(String campusRole) {
        this.campusRole = campusRole;
    }
}
