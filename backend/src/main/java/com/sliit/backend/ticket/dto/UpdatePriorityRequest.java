package com.sliit.backend.ticket.dto;

import com.sliit.backend.ticket.TicketPriority;
import jakarta.validation.constraints.NotNull;

/** Admin-only priority change on an existing ticket. */
public record UpdatePriorityRequest(@NotNull TicketPriority priority) {
}
