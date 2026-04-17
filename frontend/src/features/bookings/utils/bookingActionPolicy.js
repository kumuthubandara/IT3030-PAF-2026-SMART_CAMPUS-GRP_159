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

/** @param {string} status */
export function isBookingReadOnly(status) {
  const s = String(status ?? "")
    .trim()
    .toUpperCase();
  return s === "CANCELLED" || s === "REJECTED";
}
