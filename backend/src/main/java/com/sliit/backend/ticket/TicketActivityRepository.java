package com.sliit.backend.ticket;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/** Stores {@link TicketActivity} audit entries keyed by ticket id. */
public interface TicketActivityRepository extends MongoRepository<TicketActivity, Long> {
    List<TicketActivity> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
}
