package com.sliit.backend.ticket;

import com.sliit.backend.ticket.dto.AttachmentUploadRequest;
import com.sliit.backend.ticket.dto.CommentRequest;
import com.sliit.backend.ticket.dto.CreateTicketRequest;
import com.sliit.backend.ticket.dto.UpdatePriorityRequest;
import com.sliit.backend.ticket.dto.UpdateStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class TicketController {

    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody CreateTicketRequest request, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createTicket(request, authentication));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public List<Ticket> listTickets(Authentication authentication,
                                    @RequestParam(required = false) TicketStatus status,
                                    @RequestParam(required = false) TicketPriority priority,
                                    @RequestParam(required = false) String q) {
        return service.listTickets(authentication, status, priority, q);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public Ticket getTicket(@PathVariable Long id, Authentication authentication) {
        return service.getTicket(id, authentication);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Ticket updateStatus(@PathVariable Long id,
                               @Valid @RequestBody UpdateStatusRequest request,
                               Authentication authentication) {
        return service.updateStatus(id, request.status(), request.resolutionNotes(), authentication);
    }

    @PutMapping("/{id}/priority")
    @PreAuthorize("hasRole('ADMIN')")
    public Ticket updatePriority(@PathVariable Long id,
                                 @Valid @RequestBody UpdatePriorityRequest request,
                                 Authentication authentication) {
        return service.updatePriority(id, request.priority(), authentication);
    }

    @PutMapping("/{id}/assign/{technicianUsername}")
    @PreAuthorize("hasRole('ADMIN')")
    public Ticket assignTechnician(@PathVariable Long id,
                                   @PathVariable String technicianUsername,
                                   Authentication authentication) {
        return service.assignTechnician(id, technicianUsername, authentication);
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public ResponseEntity<TicketComment> addComment(@PathVariable Long id,
                                                    @Valid @RequestBody CommentRequest request,
                                                    Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addComment(id, request, authentication));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public TicketComment editComment(@PathVariable Long ticketId,
                                     @PathVariable Long commentId,
                                     @Valid @RequestBody CommentRequest request,
                                     Authentication authentication) {
        return service.editComment(ticketId, commentId, request, authentication);
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public ResponseEntity<Void> deleteComment(@PathVariable Long ticketId,
                                              @PathVariable Long commentId,
                                              Authentication authentication) {
        service.deleteComment(ticketId, commentId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/attachments")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<TicketAttachment>> addAttachments(@PathVariable Long id,
                                                                 @Valid @RequestBody AttachmentUploadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addAttachments(id, request));
    }

    @GetMapping("/{id}/activities")
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public List<TicketActivity> listActivities(@PathVariable Long id, Authentication authentication) {
        return service.listTicketActivities(id, authentication);
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> exportTickets(Authentication authentication,
                                                @RequestParam(required = false) TicketStatus status,
                                                @RequestParam(required = false) TicketPriority priority,
                                                @RequestParam(required = false) String q) {
        String csv = service.exportTicketsCsv(authentication, status, priority, q);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=tickets-report.csv")
                .contentType(new MediaType("text", "csv"))
                .body(csv);
    }
}
