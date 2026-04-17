package com.sliit.backend.activity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "recent_activities")
public class RecentActivity {

    @Id
    private Long id;
    private String category;
    private String message;

    /** Requester / actor email for booking & contact events — used to scope student & lecturer feeds. */
    private String relatedUserEmail;

    /** True for equipment bookings and contact messages — shown on technician dashboards. */
    private boolean technicianRelevant;

    private LocalDateTime createdAt;

    public void onCreateDefaults() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getRelatedUserEmail() {
        return relatedUserEmail;
    }

    public void setRelatedUserEmail(String relatedUserEmail) {
        this.relatedUserEmail = relatedUserEmail;
    }

    public boolean isTechnicianRelevant() {
        return technicianRelevant;
    }

    public void setTechnicianRelevant(boolean technicianRelevant) {
        this.technicianRelevant = technicianRelevant;
    }
}
