package com.sliit.backend.booking;

import com.sliit.backend.activity.RecentActivityService;
import com.sliit.backend.resource.Resource;
import com.sliit.backend.resource.ResourceRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;

@Service
public class BookingService {

    private static final DateTimeFormatter LOCAL_ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final RecentActivityService recentActivityService;
    private final MongoTemplate mongoTemplate;

    public BookingService(
            BookingRepository bookingRepository,
            ResourceRepository resourceRepository,
            RecentActivityService recentActivityService,
            MongoTemplate mongoTemplate) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.recentActivityService = recentActivityService;
        this.mongoTemplate = mongoTemplate;
    }

    public Booking create(CreateBookingRequest request) {
        Resource resource = loadBookableResource(request.getResourceId());
        Instant start = parseInstant(request.getStartDateTime());
        Instant end = parseInstant(request.getEndDateTime());
        validateTimesAndCapacity(
                resource,
                start,
                end,
                request.getExpectedAttendees(),
                null,
                normalizeRequesterRole(request.getRequesterRole()));

        Booking booking = new Booking();
        applyResourceSnapshot(booking, resource);
        booking.setStartDateTime(start);
        booking.setEndDateTime(end);
        booking.setPurpose(request.getPurpose().trim());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setRequesterEmail(normalizeEmail(request.getRequesterEmail()));
        booking.setRequesterName(trimToNull(request.getRequesterName()));
        booking.setRequesterRole(normalizeRequesterRole(request.getRequesterRole()));
        booking.setCreatedAt(Instant.now());

        Booking saved = bookingRepository.save(booking);
        recentActivityService.add(
                "BOOKING",
                "New booking request (" + labelType(resource) + "): "
                        + saved.getRoomName()
                        + " ("
                        + saved.getRequesterEmail()
                        + ") — pending approval",
                saved.getRequesterEmail(),
                isEquipmentResourceType(resource.getType()));
        return saved;
    }

    public Booking update(String bookingId, String requesterEmail, UpdateBookingRequest request) {
        String normalized = normalizeEmail(requesterEmail);
        if (normalized == null || normalized.isEmpty()) {
            throw new IllegalArgumentException("Email is required to update a booking");
        }
        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getRequesterEmail() == null || !booking.getRequesterEmail().equalsIgnoreCase(normalized)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own bookings");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be updated");
        }

        Resource resource = loadBookableResource(request.getResourceId());
        Instant start = parseInstant(request.getStartDateTime());
        Instant end = parseInstant(request.getEndDateTime());
        validateTimesAndCapacity(
                resource,
                start,
                end,
                request.getExpectedAttendees(),
                bookingId,
                normalizeRequesterRole(booking.getRequesterRole()));

        applyResourceSnapshot(booking, resource);
        booking.setStartDateTime(start);
        booking.setEndDateTime(end);
        booking.setPurpose(request.getPurpose().trim());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return bookingRepository.save(booking);
    }

    public void delete(String bookingId, String requesterEmail) {
        String normalized = normalizeEmail(requesterEmail);
        if (normalized == null || normalized.isEmpty()) {
            throw new IllegalArgumentException("Email is required to delete a booking");
        }
        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getRequesterEmail() == null || !booking.getRequesterEmail().equalsIgnoreCase(normalized)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own bookings");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be deleted");
        }
        bookingRepository.delete(booking);
    }

    public List<Booking> findMine(String email) {
        String normalized = normalizeEmail(email);
        if (normalized == null || normalized.isEmpty()) {
            return List.of();
        }
        return bookingRepository.findByRequesterEmailIgnoreCaseOrderByStartDateTimeDesc(normalized);
    }

    /**
     * Public check-in verification for QR codes: only {@link BookingStatus#APPROVED} bookings resolve.
     */
    public CheckInVerificationResponse getCheckInVerification(String bookingId) {
        if (bookingId == null || bookingId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found");
        }
        Booking booking = bookingRepository
                .findById(bookingId.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Check-in verification is only available for approved bookings");
        }
        Resource resource = null;
        String rid = booking.getResourceId();
        if (rid != null && !rid.isBlank()) {
            resource = resourceRepository.findById(rid.trim()).orElse(null);
        }
        return CheckInVerificationResponse.fromApproved(resource, booking);
    }

    /**
     * Cancels an <strong>approved</strong> booking (user withdraws the reservation). Pending requests
     * should be removed with {@link #delete(String, String)} instead.
     */
    public Booking cancel(String bookingId, String requesterEmail) {
        String normalized = normalizeEmail(requesterEmail);
        if (normalized == null || normalized.isEmpty()) {
            throw new IllegalArgumentException("Email is required to cancel a booking");
        }
        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getRequesterEmail() == null
                || !booking.getRequesterEmail().equalsIgnoreCase(normalized)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved bookings can be cancelled; withdraw pending requests with delete.");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    public List<Booking> searchForAdmin(
            String statusRaw,
            String resourceType,
            String dateRaw,
            String requester,
            String location,
            String requesterRoleRaw) {
        List<Criteria> parts = new ArrayList<>();

        if (StringUtils.hasText(statusRaw)) {
            try {
                parts.add(Criteria.where("status").is(BookingStatus.valueOf(statusRaw.trim().toUpperCase(Locale.ROOT))));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid status: " + statusRaw);
            }
        }

        if (StringUtils.hasText(resourceType)) {
            parts.add(Criteria.where("resourceType").regex(resourceType.trim(), "i"));
        }

        if (StringUtils.hasText(dateRaw)) {
            LocalDate day = LocalDate.parse(dateRaw.trim());
            ZoneId z = ZoneId.systemDefault();
            Instant dayStart = day.atStartOfDay(z).toInstant();
            Instant dayEnd = day.plusDays(1).atStartOfDay(z).toInstant();
            parts.add(Criteria.where("startDateTime").lt(dayEnd));
            parts.add(Criteria.where("endDateTime").gt(dayStart));
        }

        if (StringUtils.hasText(requester)) {
            String q = requester.trim();
            parts.add(new Criteria().orOperator(
                    Criteria.where("requesterEmail").regex(q, "i"),
                    Criteria.where("requesterName").regex(q, "i")));
        }

        if (StringUtils.hasText(location)) {
            parts.add(Criteria.where("location").regex(location.trim(), "i"));
        }

        if (StringUtils.hasText(requesterRoleRaw)) {
            String rr = requesterRoleRaw.trim().toLowerCase(Locale.ROOT);
            parts.add(Criteria.where("requesterRole").is(rr));
        }

        Query query = parts.isEmpty()
                ? new Query()
                : Query.query(new Criteria().andOperator(parts.toArray(new Criteria[0])));
        query.with(Sort.by(Sort.Direction.DESC, "startDateTime"));
        return mongoTemplate.find(query, Booking.class);
    }

    public Booking approve(String bookingId) {
        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be approved");
        }
        if (hasOverlap(booking.getResourceId(), booking.getStartDateTime(), booking.getEndDateTime(), booking.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This time range overlaps another booking for this resource.");
        }
        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);
        Booking saved = bookingRepository.save(booking);
        recentActivityService.add(
                "BOOKING",
                "Booking approved: "
                        + saved.getRoomName()
                        + " ("
                        + saved.getRequesterEmail()
                        + ") "
                        + formatRange(saved),
                saved.getRequesterEmail(),
                isEquipmentResourceType(saved.getResourceType()));
        return saved;
    }

    public Booking reject(String bookingId, String reason) {
        String trimmed = trimToNull(reason);
        if (trimmed == null) {
            throw new IllegalArgumentException("Rejection reason is required");
        }
        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(trimmed);
        Booking saved = bookingRepository.save(booking);
        recentActivityService.add(
                "BOOKING",
                "Booking rejected: "
                        + saved.getRoomName()
                        + " ("
                        + saved.getRequesterEmail()
                        + ") — "
                        + trimmed,
                saved.getRequesterEmail(),
                isEquipmentResourceType(saved.getResourceType()));
        return saved;
    }

    private static boolean isEquipmentResourceType(String type) {
        if (type == null || type.isBlank()) {
            return false;
        }
        return type.toLowerCase(Locale.ROOT).contains("equipment");
    }

    private Resource loadBookableResource(String resourceId) {
        Resource resource = resourceRepository
                .findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        if (!isBookableResource(resource)) {
            throw new IllegalArgumentException(
                    "Bookings are only supported for lecture halls, computer labs, meeting rooms, library workspaces, and equipment");
        }
        String status = resource.getStatus() != null ? resource.getStatus().trim().toUpperCase(Locale.ROOT) : "";
        if (!status.equals("ACTIVE") && !status.equals("AVAILABLE")) {
            throw new IllegalArgumentException("Resource is not available for booking");
        }
        return resource;
    }

    private void validateTimesAndCapacity(
            Resource resource,
            Instant start,
            Instant end,
            int attendees,
            String excludeBookingId,
            String requesterRoleNormalized) {
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (isMeetingRoomType(resource)) {
            validateMeetingRoomAttendees(resource, attendees, requesterRoleNormalized);
        } else {
            Integer cap = resource.getCapacity();
            if (cap != null && attendees > cap) {
                throw new IllegalArgumentException("Expected attendees exceeds resource capacity");
            }
        }
        if (hasOverlap(resource.getId(), start, end, excludeBookingId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This time range overlaps an existing booking for this resource.");
        }
    }

    private static boolean isMeetingRoomType(Resource resource) {
        String type = resource.getType();
        if (type == null) {
            return false;
        }
        return type.trim().toLowerCase(Locale.ROOT).contains("meeting");
    }

    /**
     * Meeting rooms: students 5–8 (capped by capacity); other roles 1–8 (capped by capacity).
     */
    private static void validateMeetingRoomAttendees(Resource resource, int attendees, String requesterRoleNormalized) {
        Integer cap = resource.getCapacity();
        int maxAllowed = 8;
        if (cap != null) {
            maxAllowed = Math.min(maxAllowed, cap);
        }
        String role = requesterRoleNormalized != null ? requesterRoleNormalized.trim().toLowerCase(Locale.ROOT) : "";
        if ("student".equals(role)) {
            if (attendees < 5) {
                throw new IllegalArgumentException(
                        "For meeting rooms, student bookings require at least 5 expected attendees.");
            }
            if (attendees > maxAllowed) {
                throw new IllegalArgumentException(
                        "For meeting rooms, student bookings may not exceed " + maxAllowed + " expected attendees.");
            }
        } else {
            if (attendees < 1) {
                throw new IllegalArgumentException("Expected attendees must be at least 1");
            }
            if (attendees > maxAllowed) {
                throw new IllegalArgumentException(
                        "For meeting rooms, expected attendees may not exceed " + maxAllowed + ".");
            }
        }
    }

    private void applyResourceSnapshot(Booking booking, Resource resource) {
        booking.setResourceId(resource.getId());
        booking.setResourceType(trimToNull(resource.getType()));
        booking.setRoomName(resource.getName() != null ? resource.getName() : labelType(resource));
        booking.setLocation(trimToNull(resource.getLocation()));
    }

    private static String labelType(Resource resource) {
        String t = resource.getType();
        return t != null && !t.isBlank() ? t : "Resource";
    }

    private boolean hasOverlap(String resourceId, Instant start, Instant end, String excludeBookingId) {
        List<Booking> existing =
                bookingRepository.findByResourceIdAndStatusIn(resourceId, EnumSet.of(BookingStatus.PENDING, BookingStatus.APPROVED));
        for (Booking b : existing) {
            if (excludeBookingId != null && excludeBookingId.equals(b.getId())) {
                continue;
            }
            if (rangesOverlap(b.getStartDateTime(), b.getEndDateTime(), start, end)) {
                return true;
            }
        }
        return false;
    }

    private static boolean rangesOverlap(Instant aStart, Instant aEnd, Instant bStart, Instant bEnd) {
        return aStart.isBefore(bEnd) && aEnd.isAfter(bStart);
    }

    private static Instant parseInstant(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Date/time is required");
        }
        String value = raw.trim();
        try {
            if (value.endsWith("Z") || value.contains("+") || value.length() > 19 && value.charAt(19) == '-') {
                return Instant.parse(value);
            }
            LocalDateTime ldt = LocalDateTime.parse(value, LOCAL_ISO);
            return ldt.atZone(ZoneId.systemDefault()).toInstant();
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Invalid date/time format: " + raw);
        }
    }

    private static boolean isBookableResource(Resource resource) {
        String type = resource.getType();
        if (type == null) {
            return false;
        }
        String t = type.trim().toLowerCase(Locale.ROOT);
        return t.contains("lecture")
                || t.contains("computer lab")
                || t.contains("meeting")
                || t.contains("library workspace")
                || t.contains("equipment");
    }

    private static String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String normalizeRequesterRole(String role) {
        if (role == null) {
            return null;
        }
        String t = role.trim().toLowerCase(Locale.ROOT);
        return t.isEmpty() ? null : t;
    }

    private static String formatRange(Booking b) {
        if (b.getStartDateTime() == null || b.getEndDateTime() == null) {
            return "";
        }
        return b.getStartDateTime().toString() + " → " + b.getEndDateTime().toString();
    }
}
