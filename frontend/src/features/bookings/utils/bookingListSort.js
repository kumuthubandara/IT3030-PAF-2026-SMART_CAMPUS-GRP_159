/** rawStartIso. */
function rawStartIso(raw) {
  return raw?.startDateTime ?? raw?.start ?? raw?.startTime ?? raw?.start_at ?? "";
}

/** rawStatusUpper. */
function rawStatusUpper(raw) {
  return String(raw?.status ?? "PENDING")
    .trim()
    .toUpperCase();
}

/**
 * My bookings list: pending requests first (ordered by start time within that group),
 * then all other statuses in chronological order by booking start.
 * @param {{ status: string, rawStart: string }} a normalized row
 * @param {{ status: string, rawStart: string }} b normalized row
 */
export function compareMyBookingsPendingFirstThenStart(a, b) {
  const pa =
    String(a.status ?? "")
      .trim()
      .toUpperCase() === "PENDING"
      ? 0
      : 1;
  const pb =
    String(b.status ?? "")
      .trim()
      .toUpperCase() === "PENDING"
      ? 0
      : 1;
  if (pa !== pb) return pa - pb;
  const ta = new Date(a.rawStart).getTime();
  const tb = new Date(b.rawStart).getTime();
  return (Number.isNaN(ta) ? 0 : ta) - (Number.isNaN(tb) ? 0 : tb);
}

/** @param {object[]} rawList API booking rows */
export function sortRawBookingsPendingFirstThenStart(rawList) {
  return [...rawList].sort((a, b) => {
    const pa = rawStatusUpper(a) === "PENDING" ? 0 : 1;
    const pb = rawStatusUpper(b) === "PENDING" ? 0 : 1;
    if (pa !== pb) return pa - pb;
    const ta = new Date(rawStartIso(a)).getTime();
    const tb = new Date(rawStartIso(b)).getTime();
    return (Number.isNaN(ta) ? 0 : ta) - (Number.isNaN(tb) ? 0 : tb);
  });
}
