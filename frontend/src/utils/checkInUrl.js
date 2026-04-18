/**
 * Absolute URL for the optional `/check-in/:id` web page (bookmarks / manual links).
 * Booking QR codes use plain text instead; see `bookingQrPlainText.js`.
 * Prefer `VITE_PUBLIC_APP_ORIGIN` when `window.location.origin` would be wrong.
 * @param {string} bookingId
 */
export function buildCheckInPageUrl(bookingId) {
  const id = encodeURIComponent(String(bookingId ?? "").trim());
  const fromEnv = import.meta.env.VITE_PUBLIC_APP_ORIGIN;
  if (fromEnv != null && String(fromEnv).trim() !== "") {
    const base = String(fromEnv).trim().replace(/\/$/, "");
    return `${base}/check-in/${id}`;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/check-in/${id}`;
  }
  return `/check-in/${id}`;
}

/** True when the QR/link will not work on another device (e.g. phone) because it targets this machine only. */
export function checkInUrlIsLocalhostOnly(url) {
  const u = String(url ?? "").trim().toLowerCase();
  return u.startsWith("http://localhost") || u.startsWith("https://localhost") || u.includes("://127.0.0.1");
}
