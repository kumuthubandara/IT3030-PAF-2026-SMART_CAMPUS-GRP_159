package com.sliit.backend.ticket.exception;

/** Client or rule violation (maps to HTTP 400 in {@link com.sliit.backend.ticket.TicketExceptionHandler}). */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
