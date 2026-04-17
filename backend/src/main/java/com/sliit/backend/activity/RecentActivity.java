package com.sliit.backend.activity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "recent_activities")
public class RecentActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String category;

    @Column(nullable = false, length = 500)
    private String message;

    /** Requester / actor email for booking & contact events — used to scope student & lecturer feeds. */
    @Column(name = "related_user_email", length = 255)
    private String relatedUserEmail;

    /** True for equipment bookings and contact messages — shown on technician dashboards. */
    @Column(name = "technician_relevant", nullable = false)
    private boolean technicianRelevant;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
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
