package com.sliit.backend.booking;

import jakarta.validation.constraints.NotBlank;

public class RejectBookingRequest {

    @NotBlank(message = "reason is required")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
