package com.sliit.backend.ticket;

import com.sliit.backend.activity.RecentActivityService;
import com.sliit.backend.auth.UserRole;
import com.sliit.backend.notification.NotificationService;
import com.sliit.backend.ticket.dto.AddTicketCommentRequest;
import com.sliit.backend.ticket.dto.CreateTicketRequest;
import com.sliit.backend.ticket.dto.UpdateTicketStatusRequest;
import com.sliit.backend.user.UserAccount;
import com.sliit.backend.user.UserAccountRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final RecentActivityService recentActivityService;
    private final UserAccountRepository userAccountRepository;

    public TicketService(
            TicketRepository ticketRepository,
            NotificationService notificationService,
            RecentActivityService recentActivityService,
            UserAccountRepository userAccountRepository) {
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
        this.recentActivityService = recentActivityService;
        this.userAccountRepository = userAccountRepository;
    }

    public MaintenanceTicket create(String reporterEmail, CreateTicketRequest request) {
        MaintenanceTicket ticket = new MaintenanceTicket();
        ticket.setReporterEmail(normalizeEmail(reporterEmail));
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.ensureCommentsMutable();
        Instant now = Instant.now();
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        MaintenanceTicket saved = ticketRepository.save(ticket);
        recentActivityService.add(
                "TICKET",
                "New maintenance ticket from "
                        + saved.getReporterEmail()
                        + ": "
                        + saved.getTitle());
        return saved;
    }

    public List<MaintenanceTicket> listForReporter(String reporterEmail) {
        return ticketRepository.findByReporterEmailIgnoreCaseOrderByCreatedAtDesc(normalizeEmail(reporterEmail));
    }

    public List<MaintenanceTicket> listAll() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public MaintenanceTicket updateStatus(String ticketId, UpdateTicketStatusRequest request) {
        MaintenanceTicket ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
        TicketStatus next = request.getStatus();
        TicketStatus previous = ticket.getStatus();
        if (previous == next) {
            return ticket;
        }
        ticket.setStatus(next);
        ticket.setUpdatedAt(Instant.now());
        MaintenanceTicket saved = ticketRepository.save(ticket);

        String title = "Ticket status updated";
        String message =
                "Your ticket \"" + saved.getTitle() + "\" is now " + next.name().toLowerCase(Locale.ROOT).replace('_', ' ') + ".";

        notificationService.createSystemNotification(
                saved.getReporterEmail(),
                "TICKET_STATUS",
                title,
                message,
                saved.getId());

        recentActivityService.add(
                "TICKET",
                "Ticket "
                        + saved.getId()
                        + " status "
                        + previous.name()
                        + " → "
                        + next.name());
        return saved;
    }

    public MaintenanceTicket addComment(String ticketId, String authorEmail, AddTicketCommentRequest request) {
        MaintenanceTicket ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
        String author = normalizeEmail(authorEmail);
        TicketComment comment = new TicketComment();
        comment.setAuthorEmail(author);
        comment.setBody(request.getMessage().trim());
        comment.setCreatedAt(Instant.now());
        ticket.ensureCommentsMutable();
        ticket.getComments().add(comment);
        ticket.setUpdatedAt(Instant.now());
        MaintenanceTicket saved = ticketRepository.save(ticket);

        String reporter = saved.getReporterEmail();
        String preview = comment.getBody().length() > 160 ? comment.getBody().substring(0, 157) + "…" : comment.getBody();

        if (!author.equalsIgnoreCase(reporter)) {
            notificationService.createSystemNotification(
                    reporter,
                    "TICKET_COMMENT",
                    "New comment on your ticket",
                    preview,
                    saved.getId());
        } else {
            Set<String> staffEmails = collectStaffNotificationEmails();
            staffEmails.remove(author);
            notificationService.notifyRecipients(
                    staffEmails,
                    "TICKET_COMMENT",
                    "Reporter replied on a ticket",
                    saved.getReporterEmail() + " commented on \"" + saved.getTitle() + "\": " + preview,
                    saved.getId());
        }

        recentActivityService.add("TICKET", "Comment added on ticket " + saved.getId());
        return saved;
    }

    private Set<String> collectStaffNotificationEmails() {
        LinkedHashSet<String> emails = new LinkedHashSet<>();
        for (UserRole role : List.of(UserRole.TECHNICIAN, UserRole.ADMINISTRATOR)) {
            for (UserAccount user : userAccountRepository.findByRole(role)) {
                if (user.canLogin() && user.getEmail() != null && !user.getEmail().isBlank()) {
                    emails.add(user.getEmail().trim().toLowerCase(Locale.ROOT));
                }
            }
        }
        return emails;
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
