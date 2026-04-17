package com.sliit.backend.ticket;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, Long> {
    List<Ticket> findByCreatedUserOrderByCreatedAtDesc(String createdUser);

    List<Ticket> findByAssignedTechnicianOrderByCreatedAtDesc(String assignedTechnician);
}
