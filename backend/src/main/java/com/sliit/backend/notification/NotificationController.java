package com.sliit.backend.notification;

import com.sliit.backend.config.SecurityUtils;
import com.sliit.backend.notification.dto.CreateNotificationRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getForUser(@RequestParam String userEmail) {
        String viewer = SecurityUtils.requireEmail();
        String target = userEmail == null ? "" : userEmail.trim();
        if (target.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userEmail is required");
        }
        if (!viewer.equalsIgnoreCase(target)
                && !SecurityUtils.isAdministrator(SecurityContextHolder.getContext().getAuthentication())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot read another user's notifications");
        }
        return ResponseEntity.ok(notificationService.getForUser(target));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam String userEmail) {
        String viewer = SecurityUtils.requireEmail();
        String target = userEmail == null ? "" : userEmail.trim();
        if (target.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userEmail is required");
        }
        if (!viewer.equalsIgnoreCase(target)
                && !SecurityUtils.isAdministrator(SecurityContextHolder.getContext().getAuthentication())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot read another user's notification count");
        }
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(target)));
    }

    @PostMapping
    public ResponseEntity<Notification> create(@Valid @RequestBody CreateNotificationRequest request) {
        return ResponseEntity.ok(notificationService.create(request));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable String id,
            @RequestParam boolean read) {
        String recipient = SecurityUtils.requireEmail();
        return ResponseEntity.ok(notificationService.markAsReadForRecipient(id, read, recipient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        String recipient = SecurityUtils.requireEmail();
        notificationService.deleteForRecipient(id, recipient);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }
}
