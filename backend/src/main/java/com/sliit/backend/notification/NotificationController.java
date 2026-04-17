package com.sliit.backend.notification;

import com.sliit.backend.notification.dto.CreateNotificationRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(notificationService.getForUser(userEmail));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam String userEmail) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(userEmail)));
    }

    @PostMapping
    public ResponseEntity<Notification> create(@Valid @RequestBody CreateNotificationRequest request) {
        return ResponseEntity.ok(notificationService.create(request));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id, @RequestParam boolean read) {
        return ResponseEntity.ok(notificationService.markAsRead(id, read));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        notificationService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }
}
