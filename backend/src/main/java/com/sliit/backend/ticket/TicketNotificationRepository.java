package com.sliit.backend.ticket;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/** Inbox queries for {@link TicketNotification} per recipient username. */
public interface TicketNotificationRepository extends MongoRepository<TicketNotification, Long> {
    List<TicketNotification> findByRecipientOrderByCreatedAtDesc(String recipient);
}
