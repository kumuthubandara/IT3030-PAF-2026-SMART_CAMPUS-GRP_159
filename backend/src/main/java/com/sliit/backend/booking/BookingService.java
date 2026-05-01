package com.sliit.backend.booking;

import com.sliit.backend.activity.RecentActivityService;
import com.sliit.backend.booking.dto.BookingDecisionRequest;
import com.sliit.backend.booking.dto.CreateBookingRequest;
import com.sliit.backend.notification.NotificationService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final RecentActivityService recentActivityService;

    public BookingService(
            BookingRepository bookingRepository,
            NotificationService notificationService,
            RecentActivityService recentActivityService) {
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
        this.recentActivityService = recentActivityService;
    }

    public Booking create(String requesterEmail, CreateBookingRequest request) {
        Booking booking = new Booking();
        booking.setRequesterEmail(normalizeEmail(requesterEmail));
        booking.setResourceId(request.getResourceId().trim());
        booking.setResourceName(trimOrNull(request.getResourceName()));
        booking.setPurpose(trimOrNull(request.getPurpose()));
        booking.setStatus(BookingStatus.PENDING);
        Instant now = Instant.now();
        booking.setCreatedAt(now);
        booking.setUpdatedAt(now);
        Booking saved = bookingRepository.save(booking);
        recentActivityService.add(
                "BOOKING",
                "New booking request from "
                        + saved.getRequesterEmail()
                        + " for resource "
                        + saved.getResourceId());
        return saved;
    }

    public List<Booking> listForRequester(String requesterEmail) {
        return bookingRepository.findByRequesterEmailIgnoreCaseOrderByCreatedAtDesc(normalizeEmail(requesterEmail));
    }

    public List<Booking> listAll() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public Booking decide(String bookingId, BookingDecisionRequest request) {
        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("This booking has already been decided.");
        }
        boolean approved = Boolean.TRUE.equals(request.getApproved());
        booking.setStatus(approved ? BookingStatus.APPROVED : BookingStatus.REJECTED);
        booking.setDecisionNote(trimOrNull(request.getNote()));
        booking.setUpdatedAt(Instant.now());
        Booking saved = bookingRepository.save(booking);

        String title = approved ? "Booking approved" : "Booking rejected";
        String resourceLabel = saved.getResourceName() != null && !saved.getResourceName().isBlank()
                ? saved.getResourceName()
                : saved.getResourceId();
        String message = approved
                ? "Your booking request for \"" + resourceLabel + "\" was approved."
                : "Your booking request for \"" + resourceLabel + "\" was rejected."
                        + (saved.getDecisionNote() != null && !saved.getDecisionNote().isBlank()
                                ? " Note: " + saved.getDecisionNote()
                                : "");

        notificationService.createSystemNotification(
                saved.getRequesterEmail(),
                approved ? "BOOKING_APPROVED" : "BOOKING_REJECTED",
                title,
                message,
                saved.getId());

        recentActivityService.add(
                "BOOKING",
                (approved ? "Approved" : "Rejected")
                        + " booking "
                        + saved.getId()
                        + " for "
                        + saved.getRequesterEmail());
        return saved;
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private static String trimOrNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
