package com.sliit.backend.ticket.dto;

import com.sliit.backend.ticket.TicketPriority;
import jakarta.validation.constraints.NotNull;

public record UpdatePriorityRequest(@NotNull TicketPriority priority) {
}
