package com.sliit.backend.ticket;

import com.sliit.backend.config.SecurityUtils;
import com.sliit.backend.ticket.dto.AddTicketCommentRequest;
import com.sliit.backend.ticket.dto.CreateTicketRequest;
import com.sliit.backend.ticket.dto.UpdateTicketStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<MaintenanceTicket> create(@Valid @RequestBody CreateTicketRequest request) {
        String email = SecurityUtils.requireEmail();
        return ResponseEntity.ok(ticketService.create(email, request));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceTicket>> list() {
        String email = SecurityUtils.requireEmail();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (SecurityUtils.hasAnyStaffRole(auth)) {
            return ResponseEntity.ok(ticketService.listAll());
        }
        return ResponseEntity.ok(ticketService.listForReporter(email));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MaintenanceTicket> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        SecurityUtils.requireEmail();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!SecurityUtils.canUpdateTicketStatus(auth)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Only technicians or administrators can change ticket status.");
        }
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<MaintenanceTicket> addComment(
            @PathVariable String id,
            @Valid @RequestBody AddTicketCommentRequest request) {
        String email = SecurityUtils.requireEmail();
        return ResponseEntity.ok(ticketService.addComment(id, email, request));
    }
}
