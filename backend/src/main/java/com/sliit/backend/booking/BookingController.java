package com.sliit.backend.booking;

import com.sliit.backend.booking.dto.BookingDecisionRequest;
import com.sliit.backend.booking.dto.CreateBookingRequest;
import com.sliit.backend.config.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Booking> create(@Valid @RequestBody CreateBookingRequest request) {
        String email = SecurityUtils.requireEmail();
        return ResponseEntity.ok(bookingService.create(email, request));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> list() {
        String email = SecurityUtils.requireEmail();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (SecurityUtils.isAdministrator(auth)) {
            return ResponseEntity.ok(bookingService.listAll());
        }
        return ResponseEntity.ok(bookingService.listForRequester(email));
    }

    @PatchMapping("/{id}/decision")
    public ResponseEntity<Booking> decide(
            @PathVariable String id,
            @Valid @RequestBody BookingDecisionRequest request) {
        SecurityUtils.requireEmail();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!SecurityUtils.isAdministrator(auth)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only administrators can approve or reject bookings.");
        }
        return ResponseEntity.ok(bookingService.decide(id, request));
    }
}
