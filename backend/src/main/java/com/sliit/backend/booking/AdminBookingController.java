package com.sliit.backend.booking;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@CrossOrigin(origins = "*")
public class AdminBookingController {

    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<Booking> list(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "resourceType", required = false) String resourceType,
            @RequestParam(name = "date", required = false) String date,
            @RequestParam(name = "requester", required = false) String requester,
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "requesterRole", required = false) String requesterRole) {
        return bookingService.searchForAdmin(status, resourceType, date, requester, location, requesterRole);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Booking> approve(@PathVariable("id") String id) {
        return ResponseEntity.ok(bookingService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Booking> reject(
            @PathVariable("id") String id,
            @Valid @RequestBody RejectBookingRequest body) {
        return ResponseEntity.ok(bookingService.reject(id, body.getReason()));
    }
}
