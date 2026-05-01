package com.sliit.backend.user;

/**
 * Per-user toggles for which automated notifications are delivered (special feature: notification preferences).
 * Embedded on {@link UserAccount}; when null, all categories default to enabled.
 */
public class NotificationPreferences {
    private boolean bookingUpdates = true;
    private boolean ticketStatusUpdates = true;
    private boolean ticketCommentUpdates = true;
    private boolean accountUpdates = true;

    public boolean isBookingUpdates() {
        return bookingUpdates;
    }

    public void setBookingUpdates(boolean bookingUpdates) {
        this.bookingUpdates = bookingUpdates;
    }

    public boolean isTicketStatusUpdates() {
        return ticketStatusUpdates;
    }

    public void setTicketStatusUpdates(boolean ticketStatusUpdates) {
        this.ticketStatusUpdates = ticketStatusUpdates;
    }

    public boolean isTicketCommentUpdates() {
        return ticketCommentUpdates;
    }

    public void setTicketCommentUpdates(boolean ticketCommentUpdates) {
        this.ticketCommentUpdates = ticketCommentUpdates;
    }

    public boolean isAccountUpdates() {
        return accountUpdates;
    }

    public void setAccountUpdates(boolean accountUpdates) {
        this.accountUpdates = accountUpdates;
    }
}
