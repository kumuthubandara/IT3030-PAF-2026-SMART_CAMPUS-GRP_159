package com.sliit.backend.ticket.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Up to three evidence image references (HTTPS, localhost, blob, or data:image URLs validated server-side). */
public record AttachmentUploadRequest(
        @NotEmpty @Size(max = 3) List<@Size(min = 1, max = 800_000) String> imageUrls
) {
}
