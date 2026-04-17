package com.sliit.backend.ticket;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketNotificationRepository extends MongoRepository<TicketNotification, Long> {
    List<TicketNotification> findByRecipientOrderByCreatedAtDesc(String recipient);
}
