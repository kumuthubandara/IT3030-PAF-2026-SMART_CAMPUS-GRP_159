package com.sliit.backend.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body for adding or editing a ticket comment. */
public record CommentRequest(
        @NotBlank @Size(max = 2000) String message
) {
}
