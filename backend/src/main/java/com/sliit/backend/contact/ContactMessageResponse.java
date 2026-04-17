package com.sliit.backend.contact;

import java.time.LocalDateTime;

public class ContactMessageResponse {
    private String id;
    private String status;
    private LocalDateTime createdAt;

    public ContactMessageResponse(String id, String status, LocalDateTime createdAt) {
        this.id = id;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
