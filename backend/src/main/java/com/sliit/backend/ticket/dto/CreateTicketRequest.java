package com.sliit.backend.ticket.dto;

import com.sliit.backend.ticket.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 2000) String description,
        @NotBlank @Size(max = 80) String category,
        @NotNull TicketPriority priority,
        @NotBlank @Size(max = 150) String location
) {
}
