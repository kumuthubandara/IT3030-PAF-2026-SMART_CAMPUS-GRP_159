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
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketNotificationRepository notificationRepository;
    private final TicketActivityRepository activityRepository;

    public TicketService(TicketRepository ticketRepository,
                         TicketCommentRepository commentRepository,
                         TicketAttachmentRepository attachmentRepository,
                         TicketNotificationRepository notificationRepository,
                         TicketActivityRepository activityRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.attachmentRepository = attachmentRepository;
        this.notificationRepository = notificationRepository;
        this.activityRepository = activityRepository;
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
        Ticket saved = ticketRepository.save(ticket);
        createActivity(saved, auth.getName(), "Ticket created");
        return saved;
    }

    public List<Ticket> listTickets(Authentication auth, TicketStatus status, TicketPriority priority, String q) {
        List<Ticket> base;
        if (hasRole(auth, "ROLE_ADMIN")) {
            base = ticketRepository.findAll();
        } else if (hasRole(auth, "ROLE_TECHNICIAN")) {
            base = ticketRepository.findAll().stream()
                    .filter(t -> Objects.equals(t.getAssignedTechnician(), auth.getName()))
                    .toList();
        } else {
            base = ticketRepository.findByCreatedUserOrderByCreatedAtDesc(auth.getName());
        }
        String keyword = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        return base.stream()
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> priority == null || t.getPriority() == priority)
                .filter(t -> keyword.isBlank()
                        || t.getTitle().toLowerCase(Locale.ROOT).contains(keyword)
                        || t.getDescription().toLowerCase(Locale.ROOT).contains(keyword)
                        || t.getCategory().toLowerCase(Locale.ROOT).contains(keyword)
                        || t.getLocation().toLowerCase(Locale.ROOT).contains(keyword))
                .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
                .toList();
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
    public Ticket updateStatus(Long id, TicketStatus nextStatus, String resolutionNotes, Authentication auth) {
        Ticket ticket = findTicket(id);
        if (hasRole(auth, "ROLE_TECHNICIAN")) {
            if (ticket.getAssignedTechnician() == null || !ticket.getAssignedTechnician().equals(auth.getName())) {
                throw new BadRequestException("Technician can only update assigned tickets.");
            }
        }
        validateTransition(ticket.getStatus(), nextStatus);
        ticket.setStatus(nextStatus);
        if ((nextStatus == TicketStatus.RESOLVED || nextStatus == TicketStatus.CLOSED) && (resolutionNotes == null || resolutionNotes.isBlank())) {
            throw new BadRequestException("Resolution notes are required when resolving or closing tickets.");
        }
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            ticket.setResolutionNotes(resolutionNotes.trim());
        }
        ticket.setUpdatedAt(LocalDateTime.now());
        createNotification(ticket, auth.getName(), "Ticket status changed to " + nextStatus);
        Ticket saved = ticketRepository.save(ticket);
        createActivity(saved, auth.getName(), "Status changed to " + nextStatus);
        return saved;
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
        Ticket saved = ticketRepository.save(ticket);
        createActivity(saved, auth.getName(), "Assigned technician: " + technicianUsername);
        return saved;
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
        createActivity(ticket, auth.getName(), "Comment added");
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
        createActivity(comment.getTicket(), auth.getName(), "Comment deleted");
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
        List<TicketAttachment> saved = attachmentRepository.saveAll(newAttachments);
        createActivity(ticket, "system", "Added " + saved.size() + " attachment(s)");
        return saved;
    }

    public List<TicketNotification> getMyNotifications(Authentication auth) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(auth.getName());
    }

    public List<TicketActivity> listTicketActivities(Long ticketId, Authentication auth) {
        getTicket(ticketId, auth);
        return activityRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
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

    private void createActivity(Ticket ticket, String actor, String action) {
        TicketActivity activity = new TicketActivity();
        activity.setTicket(ticket);
        activity.setActor(actor);
        activity.setAction(action);
        activityRepository.save(activity);
    }
}
