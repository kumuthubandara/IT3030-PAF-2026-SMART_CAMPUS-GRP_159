package com.sliit.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static String requireEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        Object principal = auth.getPrincipal();
        if (principal == null || principal.toString().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return principal.toString().trim().toLowerCase();
    }

    public static boolean hasAnyStaffRole(Authentication auth) {
        if (auth == null) {
            return false;
        }
        for (GrantedAuthority ga : auth.getAuthorities()) {
            String r = ga.getAuthority();
            if ("ROLE_ADMINISTRATOR".equals(r) || "ROLE_ADMIN".equals(r) || "ROLE_TECHNICIAN".equals(r)) {
                return true;
            }
        }
        return false;
    }

    public static boolean isAdministrator(Authentication auth) {
        if (auth == null) {
            return false;
        }
        for (GrantedAuthority ga : auth.getAuthorities()) {
            String r = ga.getAuthority();
            if ("ROLE_ADMINISTRATOR".equals(r) || "ROLE_ADMIN".equals(r)) {
                return true;
            }
        }
        return false;
    }

    public static boolean canUpdateTicketStatus(Authentication auth) {
        return hasAnyStaffRole(auth);
    }
}
