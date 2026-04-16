package com.sliit.backend.ticket;

import com.sliit.backend.ticket.dto.AttachmentUploadRequest;
import com.sliit.backend.ticket.dto.CommentRequest;
import com.sliit.backend.ticket.dto.CreateTicketRequest;
import com.sliit.backend.ticket.exception.BadRequestException;
import com.sliit.backend.ticket.exception.NotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketNotificationRepository notificationRepository;

    public TicketService(TicketRepository ticketRepository,
                         TicketCommentRepository commentRepository,
                         TicketAttachmentRepository attachmentRepository,
                         TicketNotificationRepository notificationRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.attachmentRepository = attachmentRepository;
        this.notificationRepository = notificationRepository;
    }

    public Ticket createTicket(CreateTicketRequest request, Authentication auth) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setCategory(request.category());
        ticket.setPriority(request.priority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setLocation(request.location());
        ticket.setCreatedUser(auth.getName());
        return ticketRepository.save(ticket);
    }

    public List<Ticket> listTickets(Authentication auth) {
        if (hasRole(auth, "ROLE_ADMIN")) {
            return ticketRepository.findAll().stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .toList();
        }
        return ticketRepository.findByCreatedUserOrderByCreatedAtDesc(auth.getName());
    }

    public Ticket getTicket(Long id, Authentication auth) {
        Ticket ticket = findTicket(id);
        if (hasRole(auth, "ROLE_ADMIN") || ticket.getCreatedUser().equals(auth.getName())
                || (ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().equals(auth.getName()))) {
            return ticket;
        }
        throw new BadRequestException("You are not allowed to view this ticket.");
    }

    @Transactional
    public Ticket updateStatus(Long id, TicketStatus nextStatus, Authentication auth) {
        Ticket ticket = findTicket(id);
        if (hasRole(auth, "ROLE_TECHNICIAN")) {
            if (ticket.getAssignedTechnician() == null || !ticket.getAssignedTechnician().equals(auth.getName())) {
                throw new BadRequestException("Technician can only update assigned tickets.");
            }
        }
        validateTransition(ticket.getStatus(), nextStatus);
        ticket.setStatus(nextStatus);
        ticket.setUpdatedAt(LocalDateTime.now());
        createNotification(ticket, auth.getName(), "Ticket status changed to " + nextStatus);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket assignTechnician(Long id, String technicianUsername, Authentication auth) {
        if (!hasRole(auth, "ROLE_ADMIN")) {
            throw new BadRequestException("Only admin can assign technicians.");
        }
        Ticket ticket = findTicket(id);
        ticket.setAssignedTechnician(technicianUsername);
        ticket.setUpdatedAt(LocalDateTime.now());
        createNotification(ticket, auth.getName(), "Ticket assigned to " + technicianUsername);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public TicketComment addComment(Long ticketId, CommentRequest request, Authentication auth) {
        Ticket ticket = findTicket(ticketId);
        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(auth.getName());
        comment.setMessage(request.message());
        TicketComment saved = commentRepository.save(comment);
        createNotification(ticket, auth.getName(), "New comment added to ticket.");
        return saved;
    }

    @Transactional
    public TicketComment editComment(Long ticketId, Long commentId, CommentRequest request, Authentication auth) {
        findTicket(ticketId);
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found."));
        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new BadRequestException("Comment does not belong to this ticket.");
        }
        if (!comment.getAuthor().equals(auth.getName())) {
            throw new BadRequestException("You can only edit your own comment.");
        }
        comment.setMessage(request.message());
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long ticketId, Long commentId, Authentication auth) {
        findTicket(ticketId);
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found."));
        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new BadRequestException("Comment does not belong to this ticket.");
        }
        if (!comment.getAuthor().equals(auth.getName()) && !hasRole(auth, "ROLE_ADMIN")) {
            throw new BadRequestException("You can only delete your own comment.");
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public List<TicketAttachment> addAttachments(Long ticketId, AttachmentUploadRequest request) {
        Ticket ticket = findTicket(ticketId);
        int existing = ticket.getAttachments() == null ? 0 : ticket.getAttachments().size();
        if (existing + request.imageUrls().size() > 3) {
            throw new BadRequestException("A ticket can have a maximum of 3 images.");
        }
        List<TicketAttachment> newAttachments = request.imageUrls().stream().map(url -> {
            TicketAttachment attachment = new TicketAttachment();
            attachment.setTicket(ticket);
            attachment.setImageUrl(url);
            return attachment;
        }).toList();
        return attachmentRepository.saveAll(newAttachments);
    }

    public List<TicketNotification> getMyNotifications(Authentication auth) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(auth.getName());
    }

    private Ticket findTicket(Long id) {
        return ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found."));
    }

    private void validateTransition(TicketStatus current, TicketStatus next) {
        if (current == next) {
            return;
        }
        boolean valid = switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.OPEN;
            case RESOLVED -> next == TicketStatus.CLOSED || next == TicketStatus.IN_PROGRESS;
            case CLOSED, REJECTED -> false;
        };
        if (!valid) {
            throw new BadRequestException("Invalid ticket status transition from " + current + " to " + next + ".");
        }
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(role));
    }

    private void createNotification(Ticket ticket, String actor, String message) {
        if (!ticket.getCreatedUser().equals(actor)) {
            TicketNotification owner = new TicketNotification();
            owner.setRecipient(ticket.getCreatedUser());
            owner.setTicketId(ticket.getId());
            owner.setMessage(message);
            owner.setRead(false);
            notificationRepository.save(owner);
        }
        if (ticket.getAssignedTechnician() != null && !ticket.getAssignedTechnician().equals(actor)) {
            TicketNotification technician = new TicketNotification();
            technician.setRecipient(ticket.getAssignedTechnician());
            technician.setTicketId(ticket.getId());
            technician.setMessage(message);
            technician.setRead(false);
            notificationRepository.save(technician);
        }
    }
}
