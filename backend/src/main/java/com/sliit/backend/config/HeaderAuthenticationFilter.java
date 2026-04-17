package com.sliit.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String email = request.getHeader("X-User-Email");
        String role = request.getHeader("X-User-Role");

        /*
         * For /api/** only: when headers are present, always set the security context from them.
         * Otherwise an anonymous or OAuth session principal would win and admin list calls return 403.
         */
        if (request.getRequestURI().startsWith("/api/")
                && email != null
                && !email.isBlank()
                && role != null
                && !role.isBlank()) {
            String normalizedRole = role.trim().toUpperCase();
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    email.trim().toLowerCase(),
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + normalizedRole)));
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
