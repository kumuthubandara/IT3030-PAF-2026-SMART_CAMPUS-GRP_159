package com.sliit.backend.ticket;

import java.time.LocalDateTime;

/**
 * Embedded image evidence inside a {@link Ticket} document (URL validated on upload; max three per ticket).
 */
public class TicketAttachment {

    private Long id;
    private String imageUrl;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
