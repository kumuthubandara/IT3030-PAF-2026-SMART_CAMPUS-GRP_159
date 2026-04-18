/**
 * Split stored instants into local date + times for the booking form.
 * If start/end fall on different calendar dates, the end time is still shown (same-day UX limitation).
 * @param {string} startIso
 * @param {string} endIso
 * @returns {{ bookingDate: string, startTime: string, endTime: string } | null}
 */
export function splitInstantToLocalDateAndTimes(startIso, endIso) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  /** Arrow function `pad`. */
  const pad = (n) => String(n).padStart(2, "0");
  const bookingDate = `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}`;
  const startTime = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
  const endTime = `${pad(e.getHours())}:${pad(e.getMinutes())}`;
  return { bookingDate, startTime, endTime };
}
