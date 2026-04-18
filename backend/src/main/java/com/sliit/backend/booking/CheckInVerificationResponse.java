package com.sliit.backend.booking;

import com.sliit.backend.resource.Resource;

/**
 * Read-only payload for QR check-in verification (approved bookings only).
 */
public class CheckInVerificationResponse {

    private String bookingId;
    private String status;
    private String roomName;
    private String resourceType;
    private String location;
    private String startDateTime;
    private String endDateTime;

    /** Optional venue photo URL from the resource (shown on scan page). */
    private String imageUrl;

    public static CheckInVerificationResponse fromApproved(Resource resource, Booking b) {
        CheckInVerificationResponse r = new CheckInVerificationResponse();
        r.setBookingId(b.getId());
        r.setStatus(b.getStatus() != null ? b.getStatus().name() : null);
        r.setRoomName(b.getRoomName());
        r.setResourceType(b.getResourceType());
        r.setLocation(b.getLocation());
        r.setStartDateTime(b.getStartDateTime() != null ? b.getStartDateTime().toString() : null);
        r.setEndDateTime(b.getEndDateTime() != null ? b.getEndDateTime().toString() : null);
        if (resource != null && resource.getImageUrl() != null && !resource.getImageUrl().isBlank()) {
            r.setImageUrl(resource.getImageUrl().trim());
        }
        return r;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(String startDateTime) {
        this.startDateTime = startDateTime;
    }

    public String getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(String endDateTime) {
        this.endDateTime = endDateTime;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
