/** @param {string} status */
export function canEditBooking(status) {
  return String(status ?? "")
    .trim()
    .toUpperCase() === "PENDING";
}

/** @param {string} status */
export function canDeleteBooking(status) {
  return String(status ?? "")
    .trim()
    .toUpperCase() === "PENDING";
}

/** @param {string} status */
export function canCancelApprovedBooking(status) {
  return String(status ?? "")
    .trim()
    .toUpperCase() === "APPROVED";
}

/**
 * Approved booking: cancel only while current time is strictly before the slot start.
 * After the slot has started or ended, cancel is not offered (View QR may still apply elsewhere).
 * @param {string} status
 * @param {string|Date|undefined|null} startIso booking start instant
 */
export function canCancelApprovedBookingNow(status, startIso) {
  if (!canCancelApprovedBooking(status)) return false;
  const raw = startIso instanceof Date ? startIso.toISOString() : String(startIso ?? "").trim();
  if (!raw) return false;
  const startMs = new Date(raw).getTime();
  if (Number.isNaN(startMs)) return false;
  return Date.now() < startMs;
}

/** @param {string} status */
export function isBookingReadOnly(status) {
  const s = String(status ?? "")
    .trim()
    .toUpperCase();
  return s === "CANCELLED" || s === "REJECTED";
}
