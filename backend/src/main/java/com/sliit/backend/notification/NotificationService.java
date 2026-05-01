package com.sliit.backend.notification;

import com.sliit.backend.notification.dto.CreateNotificationRequest;
import com.sliit.backend.user.NotificationPreferences;
import com.sliit.backend.user.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserAccountRepository userAccountRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserAccountRepository userAccountRepository) {
        this.notificationRepository = notificationRepository;
        this.userAccountRepository = userAccountRepository;
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
        if (!shouldDeliverSystemNotification(recipientEmail, type)) {
            return null;
        }
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

    public Optional<Notification> findById(String notificationId) {
        return notificationRepository.findById(notificationId);
    }

    public Notification markAsRead(String notificationId, boolean read) {
        Notification existing = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        existing.setRead(read);
        existing.setReadAt(read ? Instant.now() : null);
        return notificationRepository.save(existing);
    }

    public Notification markAsReadForRecipient(String notificationId, boolean read, String recipientEmail) {
        Notification existing = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        requireRecipient(existing, recipientEmail);
        existing.setRead(read);
        existing.setReadAt(read ? Instant.now() : null);
        return notificationRepository.save(existing);
    }

    public void deleteForRecipient(String notificationId, String recipientEmail) {
        Notification existing = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        requireRecipient(existing, recipientEmail);
        notificationRepository.delete(existing);
    }

    public void delete(String notificationId) {
        Notification existing = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        notificationRepository.delete(existing);
    }

    private void requireRecipient(Notification notification, String recipientEmail) {
        String expected = normalizeEmail(recipientEmail);
        String actual = normalizeEmail(notification.getRecipientEmail());
        if (!expected.equals(actual)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your notification");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    /**
     * Honors per-user {@link NotificationPreferences} for automated notifications.
     * Types such as admin alerts ({@code REGISTRATION_PENDING}) always deliver.
     */
    private boolean shouldDeliverSystemNotification(String recipientEmail, String type) {
        if (type == null) {
            return true;
        }
        String t = type.trim().toUpperCase(Locale.ROOT);
        if ("REGISTRATION_PENDING".equals(t) || "CONTACT_MESSAGE".equals(t)) {
            return true;
        }
        String email = normalizeEmail(recipientEmail);
        if (email.isEmpty()) {
            return false;
        }
        return userAccountRepository
                .findByEmailIgnoreCase(email)
                .map(user -> categoryAllowed(user.getNotificationPreferences(), t))
                .orElse(true);
    }

    private static boolean categoryAllowed(NotificationPreferences prefs, String typeUpper) {
        if (prefs == null) {
            return true;
        }
        if (typeUpper.startsWith("BOOKING_")) {
            return prefs.isBookingUpdates();
        }
        if ("TICKET_STATUS".equals(typeUpper)) {
            return prefs.isTicketStatusUpdates();
        }
        if ("TICKET_COMMENT".equals(typeUpper)) {
            return prefs.isTicketCommentUpdates();
        }
        if ("ACCOUNT_APPROVED".equals(typeUpper) || "ROLE_UPDATE".equals(typeUpper)) {
            return prefs.isAccountUpdates();
        }
        return true;
    }
}
