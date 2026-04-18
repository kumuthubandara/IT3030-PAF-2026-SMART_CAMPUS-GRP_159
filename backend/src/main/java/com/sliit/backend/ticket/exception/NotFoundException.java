package com.sliit.backend.ticket.exception;

/** Missing ticket or sub-resource (maps to HTTP 404 in {@link com.sliit.backend.ticket.TicketExceptionHandler}). */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
