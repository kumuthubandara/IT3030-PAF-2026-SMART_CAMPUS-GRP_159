package com.sliit.backend.ticket;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketNotificationRepository extends JpaRepository<TicketNotification, Long> {
    List<TicketNotification> findByRecipientOrderByCreatedAtDesc(String recipient);
}
