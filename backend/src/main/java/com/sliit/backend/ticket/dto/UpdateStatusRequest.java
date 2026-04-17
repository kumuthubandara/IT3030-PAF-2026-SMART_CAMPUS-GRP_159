package com.sliit.backend.ticket.dto;

import com.sliit.backend.ticket.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
        @NotNull TicketStatus status,
        String resolutionNotes
) {
}
