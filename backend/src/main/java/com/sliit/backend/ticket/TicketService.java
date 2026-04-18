package com.sliit.backend.ticket;

import com.sliit.backend.mongo.MongoSequenceService;
import com.sliit.backend.ticket.dto.AttachmentUploadRequest;
import com.sliit.backend.ticket.dto.CommentRequest;
import com.sliit.backend.ticket.dto.CreateTicketRequest;
import com.sliit.backend.ticket.exception.BadRequestException;
import com.sliit.backend.ticket.exception.NotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class TicketService {

    private static final String SEQ_TICKETS = "tickets";
    private static final String SEQ_COMMENTS = "ticket_comments";
    private static final String SEQ_ATTACHMENTS = "ticket_attachments";
    private static final String SEQ_ACTIVITIES = "ticket_activities";
    private static final String SEQ_NOTIFICATIONS = "ticket_notifications";

    private final TicketRepository ticketRepository;
    private final TicketActivityRepository activityRepository;
    private final TicketNotificationRepository notificationRepository;
    private final MongoSequenceService sequenceService;

    public TicketService(TicketRepository ticketRepository,
                         TicketActivityRepository activityRepository,
                         TicketNotificationRepository notificationRepository,
                         MongoSequenceService sequenceService) {
        this.ticketRepository = ticketRepository;
        this.activityRepository = activityRepository;
        this.notificationRepository = notificationRepository;
        this.sequenceService = sequenceService;
    }

    public Ticket createTicket(CreateTicketRequest request, Authentication auth) {
        Ticket ticket = new Ticket();
        ticket.setId(sequenceService.next(SEQ_TICKETS));
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setCategory(request.category());
        ticket.setPriority(request.priority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setLocation(request.location());
        ticket.setCreatedUser(auth.getName());
        ticket.setComments(new ArrayList<>());
        ticket.setAttachments(new ArrayList<>());
        ticket.touchTimestampsForInsert();
        Ticket saved = ticketRepository.save(ticket);
        createActivity(saved, auth.getName(), "Ticket created");
        return saved;
    }

    public List<Ticket> listTickets(Authentication auth, TicketStatus status, TicketPriority priority, String q) {
        List<Ticket> base;
        if (hasRole(auth, "ROLE_ADMIN")) {
            base = ticketRepository.findAll();
        } else if (hasRole(auth, "ROLE_TECHNICIAN")) {
            base = ticketRepository.findByAssignedTechnicianOrderByCreatedAtDesc(auth.getName());
        } else {
            base = ticketRepository.findByCreatedUserOrderByCreatedAtDesc(auth.getName());
        }
        String keyword = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        return base.stream()
                .map(this::normalizeLists)
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

    public String exportTicketsCsv(Authentication auth, TicketStatus status, TicketPriority priority, String q) {
        if (!hasRole(auth, "ROLE_ADMIN")) {
            throw new BadRequestException("Only admin can export ticket reports.");
        }
        List<Ticket> tickets = listTickets(auth, status, priority, q);
        StringBuilder csv = new StringBuilder();
        csv.append("id,title,category,priority,status,location,createdUser,assignedTechnician,createdAt,updatedAt,ageHours,resolutionHours,slaBreached,resolutionNotes\n");
        for (Ticket ticket : tickets) {
            csv.append(ticket.getId()).append(",")
                    .append(csvEscape(ticket.getTitle())).append(",")
                    .append(csvEscape(ticket.getCategory())).append(",")
                    .append(ticket.getPriority()).append(",")
                    .append(ticket.getStatus()).append(",")
                    .append(csvEscape(ticket.getLocation())).append(",")
                    .append(csvEscape(ticket.getCreatedUser())).append(",")
                    .append(csvEscape(ticket.getAssignedTechnician())).append(",")
                    .append(ticket.getCreatedAt()).append(",")
                    .append(ticket.getUpdatedAt()).append(",")
                    .append(ticket.getAgeHours()).append(",")
                    .append(ticket.getResolutionHours() == null ? "" : ticket.getResolutionHours()).append(",")
                    .append(ticket.isSlaBreached()).append(",")
                    .append(csvEscape(ticket.getResolutionNotes()))
                    .append("\n");
        }
        return csv.toString();
    }

    public Ticket getTicket(Long id, Authentication auth) {
        Ticket ticket = findTicket(id);
        if (hasRole(auth, "ROLE_ADMIN") || ticket.getCreatedUser().equals(auth.getName())
                || (ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().equals(auth.getName()))) {
            List<TicketActivity> acts = activityRepository.findByTicketIdOrderByCreatedAtDesc(id);
            ticket.setActivities(acts);
            return ticket;
        }
        throw new BadRequestException("You are not allowed to view this ticket.");
    }

    public Ticket updateStatus(Long id, TicketStatus nextStatus, String resolutionNotes, Authentication auth) {
        Ticket ticket = findTicket(id);
        if (hasRole(auth, "ROLE_TECHNICIAN")) {
            if (ticket.getAssignedTechnician() == null || !ticket.getAssignedTechnician().equals(auth.getName())) {
                throw new BadRequestException("Technician can only update assigned tickets.");
            }
        }
        if (nextStatus == TicketStatus.REJECTED) {
            if (resolutionNotes == null || resolutionNotes.isBlank()) {
                throw new BadRequestException("A rejection reason is required when rejecting a ticket.");
            }
        }
        validateTransition(ticket.getStatus(), nextStatus, auth);
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

    public Ticket updatePriority(Long id, TicketPriority priority, Authentication auth) {
        if (!hasRole(auth, "ROLE_ADMIN")) {
            throw new BadRequestException("Only admin can change ticket priority.");
        }
        Ticket ticket = findTicket(id);
        ticket.setPriority(priority);
        ticket.setUpdatedAt(LocalDateTime.now());
        createNotification(ticket, auth.getName(), "Ticket priority changed to " + priority);
        Ticket saved = ticketRepository.save(ticket);
        createActivity(saved, auth.getName(), "Priority changed to " + priority);
        return saved;
    }

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

    public TicketComment addComment(Long ticketId, CommentRequest request, Authentication auth) {
        Ticket ticket = findTicket(ticketId);
        LocalDateTime now = LocalDateTime.now();
        TicketComment comment = new TicketComment();
        comment.setId(sequenceService.next(SEQ_COMMENTS));
        comment.setAuthor(auth.getName());
        comment.setMessage(request.message());
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);
        ticket.getComments().add(comment);
        ticket.setUpdatedAt(now);
        ticketRepository.save(ticket);
        createNotification(ticket, auth.getName(), "New comment added to ticket.");
        createActivity(ticket, auth.getName(), "Comment added");
        return comment;
    }

    public TicketComment editComment(Long ticketId, Long commentId, CommentRequest request, Authentication auth) {
        Ticket ticket = findTicket(ticketId);
        TicketComment comment = ticket.getComments().stream()
                .filter(c -> Objects.equals(c.getId(), commentId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Comment not found."));
        if (!comment.getAuthor().equals(auth.getName())) {
            throw new BadRequestException("You can only edit your own comment.");
        }
        comment.setMessage(request.message());
        comment.setUpdatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
        return comment;
    }

    public void deleteComment(Long ticketId, Long commentId, Authentication auth) {
        Ticket ticket = findTicket(ticketId);
        TicketComment comment = ticket.getComments().stream()
                .filter(c -> Objects.equals(c.getId(), commentId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Comment not found."));
        if (!comment.getAuthor().equals(auth.getName()) && !hasRole(auth, "ROLE_ADMIN")) {
            throw new BadRequestException("You can only delete your own comment.");
        }
        ticket.getComments().removeIf(c -> Objects.equals(c.getId(), commentId));
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
        createActivity(ticket, auth.getName(), "Comment deleted");
    }

    public List<TicketAttachment> addAttachments(Long ticketId, AttachmentUploadRequest request, Authentication auth) {
        Ticket ticket = findTicket(ticketId);
        if (!hasRole(auth, "ROLE_ADMIN") && !ticket.getCreatedUser().equals(auth.getName())) {
            throw new BadRequestException("You can only add attachments to tickets you created.");
        }
        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new BadRequestException("Cannot add attachments to a closed or rejected ticket.");
        }
        int existing = ticket.getAttachments() == null ? 0 : ticket.getAttachments().size();
        if (existing + request.imageUrls().size() > 3) {
            throw new BadRequestException("A ticket can have a maximum of 3 images.");
        }
        List<TicketAttachment> saved = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (String raw : request.imageUrls()) {
            String url = validateEvidenceImageUrl(raw);
            TicketAttachment attachment = new TicketAttachment();
            attachment.setId(sequenceService.next(SEQ_ATTACHMENTS));
            attachment.setImageUrl(url);
            attachment.setCreatedAt(now);
            ticket.getAttachments().add(attachment);
            saved.add(attachment);
        }
        ticket.setUpdatedAt(now);
        ticketRepository.save(ticket);
        createActivity(ticket, auth.getName(), "Added " + saved.size() + " attachment(s)");
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
        Ticket t = ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Ticket not found."));
        return normalizeLists(t);
    }

    private Ticket normalizeLists(Ticket t) {
        if (t.getComments() == null) {
            t.setComments(new ArrayList<>());
        }
        if (t.getAttachments() == null) {
            t.setAttachments(new ArrayList<>());
        }
        return t;
    }

    /**
     * Assignment workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED; administrators may set
     * REJECTED from OPEN or IN_PROGRESS (with reason). Terminal: CLOSED, REJECTED.
     */
    private void validateTransition(TicketStatus current, TicketStatus next, Authentication auth) {
        if (current == next) {
            throw new BadRequestException("Ticket is already in status " + next + ".");
        }
        if (current == TicketStatus.CLOSED || current == TicketStatus.REJECTED) {
            throw new BadRequestException("Cannot change the status of a " + current + " ticket.");
        }
        if (next == TicketStatus.REJECTED) {
            if (!hasRole(auth, "ROLE_ADMIN")) {
                throw new BadRequestException("Only an administrator can reject a ticket.");
            }
            if (current != TicketStatus.OPEN && current != TicketStatus.IN_PROGRESS) {
                throw new BadRequestException("A ticket can only be rejected while it is OPEN or IN_PROGRESS.");
            }
            return;
        }
        switch (current) {
            case OPEN -> {
                if (next != TicketStatus.IN_PROGRESS) {
                    throw new BadRequestException("From OPEN, the next status must be IN_PROGRESS (or REJECTED by an administrator).");
                }
            }
            case IN_PROGRESS -> {
                if (next != TicketStatus.RESOLVED) {
                    throw new BadRequestException("From IN_PROGRESS, the next status must be RESOLVED (or REJECTED by an administrator).");
                }
            }
            case RESOLVED -> {
                if (next != TicketStatus.CLOSED) {
                    throw new BadRequestException("From RESOLVED, the only allowed next status is CLOSED.");
                }
            }
            default -> throw new BadRequestException("Unsupported status transition from " + current + " to " + next + ".");
        }
    }

    private static final int MAX_EVIDENCE_URL_LENGTH = 800_000;

    /**
     * Accepts HTTPS URLs, local dev HTTP, browser blob URLs, or small inline data:image/* payloads.
     * Rejects javascript: and other dangerous schemes.
     */
    private String validateEvidenceImageUrl(String raw) {
        if (raw == null) {
            throw new BadRequestException("Image URL cannot be null.");
        }
        String url = raw.trim();
        if (url.isEmpty()) {
            throw new BadRequestException("Image URL cannot be empty.");
        }
        if (url.length() > MAX_EVIDENCE_URL_LENGTH) {
            throw new BadRequestException("Image evidence exceeds maximum allowed size.");
        }
        String lower = url.toLowerCase(Locale.ROOT);
        if (lower.contains("\n") || lower.contains("\r") || lower.contains("<script")) {
            throw new BadRequestException("Invalid image URL.");
        }
        boolean ok = lower.startsWith("https://")
                || lower.startsWith("http://localhost")
                || lower.startsWith("http://127.0.0.1")
                || lower.startsWith("blob:http://")
                || lower.startsWith("blob:https://")
                || lower.startsWith("data:image/");
        if (!ok) {
            throw new BadRequestException(
                    "Image evidence must use https://, a localhost URL, a browser blob URL, or data:image/… (inline image).");
        }
        return url;
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(role));
    }

    private void createNotification(Ticket ticket, String actor, String message) {
        LocalDateTime now = LocalDateTime.now();
        if (!ticket.getCreatedUser().equals(actor)) {
            TicketNotification owner = new TicketNotification();
            owner.setId(sequenceService.next(SEQ_NOTIFICATIONS));
            owner.setRecipient(ticket.getCreatedUser());
            owner.setTicketId(ticket.getId());
            owner.setMessage(message);
            owner.setRead(false);
            owner.setCreatedAt(now);
            notificationRepository.save(owner);
        }
        if (ticket.getAssignedTechnician() != null && !ticket.getAssignedTechnician().equals(actor)) {
            TicketNotification technician = new TicketNotification();
            technician.setId(sequenceService.next(SEQ_NOTIFICATIONS));
            technician.setRecipient(ticket.getAssignedTechnician());
            technician.setTicketId(ticket.getId());
            technician.setMessage(message);
            technician.setRead(false);
            technician.setCreatedAt(now);
            notificationRepository.save(technician);
        }
    }

    private void createActivity(Ticket ticket, String actor, String action) {
        TicketActivity activity = new TicketActivity();
        activity.setId(sequenceService.next(SEQ_ACTIVITIES));
        activity.setTicketId(ticket.getId());
        activity.setActor(actor);
        activity.setAction(action);
        activity.setCreatedAt(LocalDateTime.now());
        activityRepository.save(activity);
    }

    private String csvEscape(String value) {
        if (value == null) {
            return "";
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
