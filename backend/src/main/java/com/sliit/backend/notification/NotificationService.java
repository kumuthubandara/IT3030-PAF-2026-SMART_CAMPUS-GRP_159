package com.sliit.backend.notification;

import com.sliit.backend.notification.dto.CreateNotificationRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getForUser(String userEmail) {
        return notificationRepository.findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(userEmail);
    }

    public long getUnreadCount(String userEmail) {
        return notificationRepository.countByRecipientEmailIgnoreCaseAndReadIsFalse(userEmail);
    }

    public Notification create(CreateNotificationRequest request) {
        Notification notification = new Notification();
        notification.setRecipientEmail(normalizeEmail(request.getRecipientEmail()));
        notification.setType(request.getType().trim());
        notification.setTitle(request.getTitle().trim());
        notification.setMessage(request.getMessage().trim());
        notification.setRelatedEntityId(request.getRelatedEntityId());
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());
        return notificationRepository.save(notification);
    }

    public Notification createSystemNotification(
            String recipientEmail,
            String type,
            String title,
            String message,
            String relatedEntityId) {
        Notification notification = new Notification();
        notification.setRecipientEmail(normalizeEmail(recipientEmail));
        notification.setType(type == null ? "SYSTEM" : type.trim());
        notification.setTitle(title == null ? "Update" : title.trim());
        notification.setMessage(message == null ? "" : message.trim());
        notification.setRelatedEntityId(relatedEntityId);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());
        return notificationRepository.save(notification);
    }

    public void notifyRecipients(
            Collection<String> recipientEmails,
            String type,
            String title,
            String message,
            String relatedEntityId) {
        if (recipientEmails == null || recipientEmails.isEmpty()) {
            return;
        }
        recipientEmails.stream()
                .filter(email -> email != null && !email.isBlank())
                .map(this::normalizeEmail)
                .distinct()
                .forEach(email -> createSystemNotification(email, type, title, message, relatedEntityId));
    }

    public Notification markAsRead(String notificationId, boolean read) {
        Notification existing = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        existing.setRead(read);
        existing.setReadAt(read ? Instant.now() : null);
        return notificationRepository.save(existing);
    }

    public void delete(String notificationId) {
        Notification existing = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        notificationRepository.delete(existing);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
