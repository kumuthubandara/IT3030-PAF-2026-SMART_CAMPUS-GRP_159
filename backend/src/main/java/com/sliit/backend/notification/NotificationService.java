package com.sliit.backend.notification;

import com.sliit.backend.notification.dto.CreateNotificationRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
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
        notification.setRecipientEmail(request.getRecipientEmail().trim().toLowerCase());
        notification.setType(request.getType().trim());
        notification.setTitle(request.getTitle().trim());
        notification.setMessage(request.getMessage().trim());
        notification.setRelatedEntityId(request.getRelatedEntityId());
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());
        return notificationRepository.save(notification);
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
}
