/**
 * Module B – facility / resource bookings (PAF).
 *
 * <p>Workflow: PENDING → APPROVED/REJECTED. {@link com.sliit.backend.booking.BookingController}
 * under {@code /api/bookings}; decisions notify the requester via {@code NotificationService}.</p>
 */
package com.sliit.backend.booking;
