package com.sliit.backend.ticket;

/**
 * Lifecycle states for incident tickets. Allowed transitions are enforced in
 * {@link com.sliit.backend.ticket.TicketService} when applying status updates.
 */
public enum TicketStatus {
    /** Newly reported, awaiting triage or assignment. */
    OPEN,
    /** Actively being worked (typically after technician assignment). */
    IN_PROGRESS,
    /** Fix/work complete; may still need formal closure. */
    RESOLVED,
    /** Terminal: ticket archived, no further status changes. */
    CLOSED,
    /** Terminal: declined by an administrator (requires rejection reason / notes). */
    REJECTED
}
