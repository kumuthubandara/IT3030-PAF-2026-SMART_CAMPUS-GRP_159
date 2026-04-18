package com.sliit.backend.ticket.dto;

import com.sliit.backend.ticket.TicketStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Status change request. {@code resolutionNotes} carries resolution text for RESOLVED/CLOSED
 * or the rejection reason when moving to REJECTED.
 */
public record UpdateStatusRequest(
        @NotNull TicketStatus status,
        String resolutionNotes
) {
}
