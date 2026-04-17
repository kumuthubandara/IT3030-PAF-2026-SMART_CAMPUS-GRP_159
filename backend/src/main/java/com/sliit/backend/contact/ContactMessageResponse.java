package com.sliit.backend.contact;

import java.time.LocalDateTime;

public class ContactMessageResponse {
    private Long id;
    private String status;
    private LocalDateTime createdAt;

    public ContactMessageResponse(Long id, String status, LocalDateTime createdAt) {
        this.id = id;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
