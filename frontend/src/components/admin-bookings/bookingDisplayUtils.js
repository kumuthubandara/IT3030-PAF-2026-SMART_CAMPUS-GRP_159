/** @param {string | null | undefined} iso */
export function parseBookingInstant(iso) {
  if (iso == null || String(iso).trim() === "") return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** @param {Date | null} d */
export function formatBookingDate(d) {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** @param {Date | null} d */
export function formatBookingTime(d) {
  if (!d) return "—";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
