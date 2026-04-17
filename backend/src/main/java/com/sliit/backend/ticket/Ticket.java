package com.sliit.backend.ticket;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
public class Ticket {

    @Id
    private Long id;
    private String title;
    private String description;
    private String category;
    private TicketPriority priority;
    private TicketStatus status;
    private String location;
    private String createdUser;
    private String assignedTechnician;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<TicketComment> comments = new ArrayList<>();
    private List<TicketAttachment> attachments = new ArrayList<>();

    @Transient
    private List<TicketActivity> activities = new ArrayList<>();

    public void touchTimestampsForInsert() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (status == null) {
            status = TicketStatus.OPEN;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCreatedUser() {
        return createdUser;
    }

    public void setCreatedUser(String createdUser) {
        this.createdUser = createdUser;
    }

    public String getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(String assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<TicketComment> getComments() {
        return comments;
    }

    public void setComments(List<TicketComment> comments) {
        this.comments = comments != null ? comments : new ArrayList<>();
    }

    public List<TicketAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<TicketAttachment> attachments) {
        this.attachments = attachments != null ? attachments : new ArrayList<>();
    }

    public List<TicketActivity> getActivities() {
        return activities;
    }

    public void setActivities(List<TicketActivity> activities) {
        this.activities = activities != null ? activities : new ArrayList<>();
    }

    public long getAgeHours() {
        LocalDateTime end = (status == TicketStatus.CLOSED || status == TicketStatus.RESOLVED) ? updatedAt : LocalDateTime.now();
        if (createdAt == null || end == null) {
            return 0;
        }
        return Math.max(0, Duration.between(createdAt, end).toHours());
    }

    public Long getResolutionHours() {
        if (status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) {
            if (createdAt == null || updatedAt == null) {
                return 0L;
            }
            return Math.max(0, Duration.between(createdAt, updatedAt).toHours());
        }
        return null;
    }

    public boolean isSlaBreached() {
        return (status == TicketStatus.OPEN || status == TicketStatus.IN_PROGRESS) && getAgeHours() > 48;
    }
}
