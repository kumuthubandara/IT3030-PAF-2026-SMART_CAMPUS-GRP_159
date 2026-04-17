/**
 * Absolute URL encoded in booking QR codes. Prefer `VITE_PUBLIC_APP_ORIGIN` when the app
 * is served behind a proxy and `window.location.origin` would be wrong for scanners.
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
