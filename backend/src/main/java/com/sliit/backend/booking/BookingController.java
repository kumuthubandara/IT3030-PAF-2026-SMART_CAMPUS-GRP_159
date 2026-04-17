package com.sliit.backend.booking;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<Booking> create(@Valid @RequestBody CreateBookingRequest body) {
        return ResponseEntity.ok(bookingService.create(body));
    }

    @GetMapping("/my")
    public List<Booking> myBookings(@RequestParam(name = "email", required = false) String email) {
        return bookingService.findMine(email);
    }

    /** Read-only approved booking details for QR check-in (no auth in demo). */
    @GetMapping("/{id}/check-in")
    public ResponseEntity<CheckInVerificationResponse> checkInVerify(@PathVariable("id") String id) {
        return ResponseEntity.ok(bookingService.getCheckInVerification(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> update(
            @PathVariable("id") String id,
            @RequestParam(name = "email", required = false) String email,
            @Valid @RequestBody UpdateBookingRequest body) {
        return ResponseEntity.ok(bookingService.update(id, email, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") String id,
            @RequestParam(name = "email", required = false) String email) {
        bookingService.delete(id, email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancel(
            @PathVariable("id") String id,
            @RequestParam(name = "email", required = false) String email) {
        return ResponseEntity.ok(bookingService.cancel(id, email));
    }
}
