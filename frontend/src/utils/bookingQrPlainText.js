import { normalizeBookingRow } from "../components/student-bookings/MyBookings.jsx";

function customerNameFromRawAndUser(raw, user) {
  const fromRaw = String(raw?.requesterName ?? raw?.requester_name ?? "").trim();
  if (fromRaw) return fromRaw;
  const fromUser = String(user?.name ?? "").trim();
  if (fromUser) return fromUser;
  const email = String(user?.email ?? raw?.requesterEmail ?? raw?.requester_email ?? "").trim();
  return email || "—";
}

/**
 * Plain text encoded in the booking QR (no URL — scanners show a note-style preview).
 * @param {Record<string, unknown>} raw API booking row
 * @param {Record<string, unknown>|null|undefined} user signed-in user (fallback for name)
 */
export function buildBookingConfirmationQrPlainText(raw, user) {
  const row = normalizeBookingRow(raw);
  const name = customerNameFromRawAndUser(raw, user);
  return [
    "BOOKING CONFIRMED",
    `Name: ${name}`,
    `Booking ID: ${row.id || "—"}`,
    `Date: ${row.dateLabel}`,
    `Time: ${row.timeRangeLabel}`,
    `Capacity: ${row.attendees}`,
    "Status: Confirmed",
  ].join("\n");
}
