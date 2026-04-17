import { apiUrl } from "../apiBase.js";
import { parseJsonSafe, apiError } from "../features/bookings/api/http.js";

/**
 * @param {string} bookingId
 * @returns {Promise<{
 *   bookingId: string,
 *   status: string,
 *   roomName: string,
 *   resourceType: string,
 *   location: string,
 *   startDateTime: string,
 *   endDateTime: string,
 *   imageUrl?: string
 * }>}
 */
export async function fetchCheckInVerification(bookingId) {
  const id = encodeURIComponent(String(bookingId ?? "").trim());
  const res = await fetch(apiUrl(`/api/bookings/${id}/check-in`), {
    headers: { Accept: "application/json" },
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw apiError(
      res,
      data,
      data?.message ||
        (res.status === 404
          ? "This check-in link is not valid or the booking is not approved."
          : `Could not verify booking (${res.status})`),
    );
  }
  return data;
}
