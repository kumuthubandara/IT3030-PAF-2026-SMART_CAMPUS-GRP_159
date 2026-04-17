import { apiUrl, buildAuthHeaders, parseJsonSafe, apiError } from "./http.js";

/**
 * @param {object} user
 * @param {{
 *   status?: string;
 *   resourceType?: string;
 *   date?: string;
 *   requester?: string;
 *   location?: string;
 *   requesterRole?: string;
 * }} [filters]
 */
export async function fetchAdminBookings(user, filters = {}) {
  const params = new URLSearchParams();
  if (filters.status?.trim()) params.set("status", filters.status.trim());
  if (filters.resourceType?.trim()) params.set("resourceType", filters.resourceType.trim());
  if (filters.date?.trim()) params.set("date", filters.date.trim());
  if (filters.requester?.trim()) params.set("requester", filters.requester.trim());
  if (filters.location?.trim()) params.set("location", filters.location.trim());
  if (filters.requesterRole?.trim()) params.set("requesterRole", filters.requesterRole.trim());
  const qs = params.toString();
  const res = await fetch(apiUrl(`/api/admin/bookings${qs ? `?${qs}` : ""}`), {
    headers: buildAuthHeaders(user),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw apiError(res, data, `Could not load bookings (${res.status})`);
  }
  return Array.isArray(data) ? data : [];
}

export async function approveAdminBooking(bookingId, user) {
  const res = await fetch(apiUrl(`/api/admin/bookings/${encodeURIComponent(bookingId)}/approve`), {
    method: "PATCH",
    headers: buildAuthHeaders(user),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw apiError(res, data, `Could not approve booking (${res.status})`);
  }
  return data;
}

export async function rejectAdminBooking(bookingId, reason, user) {
  const res = await fetch(apiUrl(`/api/admin/bookings/${encodeURIComponent(bookingId)}/reject`), {
    method: "PATCH",
    headers: { ...buildAuthHeaders(user), "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw apiError(res, data, `Could not reject booking (${res.status})`);
  }
  return data;
}
