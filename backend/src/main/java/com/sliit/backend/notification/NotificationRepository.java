package com.sliit.backend.notification;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(String recipientEmail);
    long countByRecipientEmailIgnoreCaseAndReadIsFalse(String recipientEmail);
}
