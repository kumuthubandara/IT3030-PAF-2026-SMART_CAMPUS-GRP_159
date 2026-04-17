import { apiUrl, buildAuthHeaders, parseJsonSafe, apiError } from "./http.js";

function requesterEmailForApi(user) {
  return String(user?.email ?? "").trim() || "";
}

function requesterRoleForApi(user) {
  const r = String(user?.role ?? "")
    .trim()
    .toLowerCase();
  return r || undefined;
}

/**
 * @param {object} user
 */
export async function fetchBookableResources(user) {
  const res = await fetch(apiUrl("/api/resources"), { headers: buildAuthHeaders(user) });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw apiError(res, data, `Could not load resources (${res.status})`);
  }
  const list = Array.isArray(data) ? data : [];
  return list.filter(isBookableResourceRow).filter(isResourceActiveRow);
}

export async function fetchResourceById(id, user) {
  const res = await fetch(apiUrl(`/api/resources/${encodeURIComponent(id)}`), {
    headers: buildAuthHeaders(user),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw apiError(res, data, `Could not load resource (${res.status})`);
  }
  return data;
}

/**
 * @param {object} payload
 * @param {object} user
 */
export async function createBooking(payload, user) {
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
    headers: { ...buildAuthHeaders(user), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw apiError(
      res,
      data,
      data?.message ||
        (res.status === 409
          ? "That time slot overlaps an existing booking for this resource."
          : `Could not submit booking (${res.status})`),
    );
  }
  return data;
}

export async function fetchMyBookings(user) {
  const email = `?email=${encodeURIComponent(requesterEmailForApi(user))}`;
  const res = await fetch(apiUrl(`/api/bookings/my${email}`), { headers: buildAuthHeaders(user) });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw apiError(res, data, `Could not load bookings (${res.status})`);
  }
  return Array.isArray(data) ? data : [];
}

export async function updateBooking(bookingId, payload, user) {
  const emailQs = `?email=${encodeURIComponent(requesterEmailForApi(user))}`;
  const res = await fetch(apiUrl(`/api/bookings/${encodeURIComponent(bookingId)}${emailQs}`), {
    method: "PUT",
    headers: { ...buildAuthHeaders(user), "Content-Type": "application/json" },
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
    throw apiError(res, data, `Could not update booking (${res.status})`);
  }
  return data;
}

export async function deleteBooking(bookingId, user) {
  const emailQs = `?email=${encodeURIComponent(requesterEmailForApi(user))}`;
  const res = await fetch(apiUrl(`/api/bookings/${encodeURIComponent(bookingId)}${emailQs}`), {
    method: "DELETE",
    headers: buildAuthHeaders(user),
  });
  if (res.status === 204) return null;
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw apiError(res, data, `Could not delete booking (${res.status})`);
  }
  return data;
}

export async function cancelApprovedBooking(bookingId, user) {
  const emailQs = `?email=${encodeURIComponent(requesterEmailForApi(user))}`;
  const res = await fetch(apiUrl(`/api/bookings/${encodeURIComponent(bookingId)}/cancel${emailQs}`), {
    method: "PATCH",
    headers: buildAuthHeaders(user),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw apiError(res, data, `Could not cancel booking (${res.status})`);
  }
  return data;
}

export function isBookableResourceRow(r) {
  const t = String(r?.type ?? "")
    .trim()
    .toLowerCase();
  return (
    t.includes("lecture") ||
    t.includes("computer lab") ||
    t.includes("meeting") ||
    t.includes("library workspace") ||
    t.includes("equipment")
  );
}

function isResourceActiveRow(r) {
  const s = String(r?.status ?? "")
    .trim()
    .toUpperCase();
  return s === "ACTIVE" || s === "AVAILABLE";
}
