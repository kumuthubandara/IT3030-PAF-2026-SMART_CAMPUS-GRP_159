package com.sliit.backend.contact;

import com.sliit.backend.activity.RecentActivityService;
import com.sliit.backend.notification.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactMessageService {

    private final ContactMessageRepository repository;
    private final RecentActivityService activityService;
    private final NotificationService notificationService;

    @Value("${app.notifications.admin-email:admin@smart-campus.local}")
    private String adminNotificationEmail;

    public ContactMessageService(
            ContactMessageRepository repository,
            RecentActivityService activityService,
            NotificationService notificationService) {
        this.repository = repository;
        this.activityService = activityService;
        this.notificationService = notificationService;
    }

    public ContactMessage save(ContactMessageRequest request) {
        ContactMessage entity = new ContactMessage();
        entity.setName(request.getName().trim());
        entity.setEmail(request.getEmail().trim());
        entity.setPhone(request.getPhone().trim());
        entity.setSubject(request.getSubject().trim());
        entity.setMessage(request.getMessage().trim());
        entity.setStatus("NEW");
        entity.setCreatedAt(LocalDateTime.now());
        ContactMessage saved = repository.save(entity);
        activityService.add("CONTACT_MESSAGE", "New contact message from " + saved.getName() + ": " + saved.getSubject());
        notificationService.notifyRecipients(
                List.of(saved.getEmail(), adminNotificationEmail),
                "CONTACT_MESSAGE",
                "Contact message received",
                "Message \"" + saved.getSubject() + "\" has been submitted.",
                String.valueOf(saved.getId()));
        return saved;
    }

    public List<ContactMessage> findAllLatestFirst() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
