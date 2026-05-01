/**
 * Spring Security, OAuth2 (Google/Microsoft), CORS, global exception handling, and setup checks.
 *
 * <p>Key types: {@link com.sliit.backend.config.SecurityConfig} (RBAC),
 * {@link com.sliit.backend.config.HeaderAuthenticationFilter} (X-User-Email / X-User-Role from React),
 * OAuth success/failure handlers redirecting to the Vite app.</p>
 */
package com.sliit.backend.config;
