package com.sliit.backend.ticket;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<MaintenanceTicket, String> {
    List<MaintenanceTicket> findByReporterEmailIgnoreCaseOrderByCreatedAtDesc(String reporterEmail);

    List<MaintenanceTicket> findAllByOrderByCreatedAtDesc();
}
