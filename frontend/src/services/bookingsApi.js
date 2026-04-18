/**
 * Student booking API — assumes Spring-style REST.
 *
 * Example payloads (request bodies):
 *
 * POST /api/bookings
 * {
 *   "resourceId": "507f1f77bcf86cd799439011",
 *   "startDateTime": "2026-04-20T09:00:00",
 *   "endDateTime": "2026-04-20T10:30:00",
 *   "purpose": "Group project sync",
 *   "expectedAttendees": 6,
 *   "requesterEmail": "student@campus.edu"
 * }
 * Expected response: { id, status: "PENDING", ... } — not final confirmation.
 *
 * GET /api/bookings/my
 * Response: [{ id, resourceId, roomName, startDateTime, endDateTime, purpose, expectedAttendees, status, rejectionReason, ... }]
 *
 * DELETE /api/bookings/{id}?email=…
 * Withdraws a PENDING booking (204 No Content).
 *
 * PATCH /api/bookings/{id}/cancel?email=…
 * Cancels an APPROVED booking only (response: status CANCELLED).
 *
 * Conflict prevention: backend returns 409 with { message } when the slot overlaps another PENDING/APPROVED booking for the same resource.
 */

import { apiUrl } from "../apiBase.js";

/** requesterEmailForApi. */
function requesterEmailForApi(user) {
  return String(user?.email ?? "").trim() || "student@campus.edu";
}

/** requesterRoleForApi. */
function requesterRoleForApi(user) {
  const r = String(user?.role ?? "")
    .trim()
    .toLowerCase();
  return r || undefined;
}

/** Helper: buildHeaders. */
function buildHeaders(user) {
  const headers = { Accept: "application/json" };
  const token = user?.token ?? user?.accessToken;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/** Helper: parseJsonSafe. */
async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/** Helper: isMeetingResourceRow. */
function isMeetingResourceRow(r) {
  return String(r?.type ?? "")
    .trim()
    .toLowerCase()
    .includes("meeting");
}

/** fetchMeetingRoomResources. */
export async function fetchMeetingRoomResources(user) {
  const headers = buildHeaders(user);
  const attempts = [
    apiUrl(`/api/resources/search/type?type=${encodeURIComponent("meeting room")}`),
    apiUrl(`/api/resources/search/type?type=${encodeURIComponent("MEETING_ROOM")}`),
    apiUrl(`/api/resources?type=${encodeURIComponent("MEETING_ROOM")}`),
    apiUrl("/api/resources"),
  ];

  for (const url of attempts) {
    const res = await fetch(url, { headers });
    if (!res.ok) continue;
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [];
    const meetingOnly = arr.filter(isMeetingResourceRow);
    if (meetingOnly.length > 0) return meetingOnly;
    if (arr.length === 0) return [];
  }

  const fallback = await fetch(apiUrl("/api/resources"), { headers });
  if (!fallback.ok) {
    const err = await parseJsonSafe(fallback);
    throw new Error(err?.message || "Failed to load resources");
  }
  const all = await fallback.json();
  const list = Array.isArray(all) ? all : [];
  return list.filter(isMeetingResourceRow);
}

/**
 * @param {object} payload
 * @param {string} payload.resourceId
 * @param {string} payload.startDateTime ISO local or Z
 * @param {string} payload.endDateTime
 * @param {string} payload.purpose
 * @param {number} payload.expectedAttendees
 * @param {object} user
 */
export async function createBookingRequest(payload, user) {
  const body = {
    resourceId: payload.resourceId,
    startDateTime: payload.startDateTime,
    endDateTime: payload.endDateTime,
    purpose: payload.purpose,
    expectedAttendees: payload.expectedAttendees,
    requesterEmail: requesterEmailForApi(user),
    requesterName: user?.name,
    ...(requesterRoleForApi(user) ? { requesterRole: requesterRoleForApi(user) } : {}),
  };

  const res = await fetch(apiUrl("/api/bookings"), {
    method: "POST",
    headers: { ...buildHeaders(user), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      (res.status === 409
        ? "That time slot is no longer available for this room."
        : `Could not submit booking (${res.status})`);
    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/** fetchMyBookings. */
export async function fetchMyBookings(user) {
  const email = `?email=${encodeURIComponent(requesterEmailForApi(user))}`;
  const res = await fetch(apiUrl(`/api/bookings/my${email}`), {
    headers: buildHeaders(user),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const err = new Error(data?.message || `Could not load bookings (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return Array.isArray(data) ? data : [];
}

/** Cancels an APPROVED booking only (server-enforced). Pending requests are removed with {@link deleteMyBooking}. */
export async function cancelBooking(bookingId, user, body = {}) {
  const emailQs = `?email=${encodeURIComponent(requesterEmailForApi(user))}`;
  const res = await fetch(apiUrl(`/api/bookings/${encodeURIComponent(bookingId)}/cancel${emailQs}`), {
    method: "PATCH",
    headers: { ...buildHeaders(user), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const err = new Error(data?.message || `Could not cancel booking (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/** Deletes a PENDING booking (withdraw request). */
export async function deleteMyBooking(bookingId, user) {
  const emailQs = `?email=${encodeURIComponent(requesterEmailForApi(user))}`;
  const res = await fetch(apiUrl(`/api/bookings/${encodeURIComponent(bookingId)}${emailQs}`), {
    method: "DELETE",
    headers: buildHeaders(user),
  });
  if (res.status === 204) return null;
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const err = new Error(data?.message || `Could not withdraw booking (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/** fetchResourceById. */
export async function fetchResourceById(id, user) {
  const res = await fetch(apiUrl(`/api/resources/${encodeURIComponent(id)}`), {
    headers: buildHeaders(user),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const err = new Error(data?.message || `Could not load resource (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/** updateBooking. */
export async function updateBooking(bookingId, payload, user) {
  const emailQs = `?email=${encodeURIComponent(requesterEmailForApi(user))}`;
  const res = await fetch(apiUrl(`/api/bookings/${encodeURIComponent(bookingId)}${emailQs}`), {
    method: "PUT",
    headers: { ...buildHeaders(user), "Content-Type": "application/json" },
    body: JSON.stringify({
      resourceId: payload.resourceId,
      startDateTime: payload.startDateTime,
      endDateTime: payload.endDateTime,
      purpose: payload.purpose,
      expectedAttendees: payload.expectedAttendees,
    }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const err = new Error(data?.message || `Could not update booking (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

