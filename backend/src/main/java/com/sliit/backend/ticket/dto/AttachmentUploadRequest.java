package com.sliit.backend.ticket.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AttachmentUploadRequest(
        @NotEmpty @Size(max = 3) List<@Size(max = 500) String> imageUrls
) {
}
