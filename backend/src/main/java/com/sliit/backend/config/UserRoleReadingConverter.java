package com.sliit.backend.config;

import com.sliit.backend.auth.UserRole;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

import java.util.Locale;

/**
 * Maps legacy role strings stored in MongoDB to the current {@link UserRole} set.
 */
@ReadingConverter
public class UserRoleReadingConverter implements Converter<String, UserRole> {
    @Override
    public UserRole convert(String source) {
        if (source == null || source.isBlank()) {
            return UserRole.STUDENT;
        }
        String s = source.trim().toUpperCase(Locale.ROOT);
        return switch (s) {
            case "USER", "STUDENT" -> UserRole.STUDENT;
            case "LECTURER" -> UserRole.LECTURER;
            case "ADMIN", "ADMINISTRATOR" -> UserRole.ADMINISTRATOR;
            case "TECH", "TECHNICIAN" -> UserRole.TECHNICIAN;
            case "MANAGER" -> UserRole.LECTURER;
            default -> {
                try {
                    yield UserRole.valueOf(s);
                } catch (IllegalArgumentException ex) {
                    yield UserRole.STUDENT;
                }
            }
        };
    }
}
