/**
 * Thin fetch wrapper for the Spring ticket module (`/api/tickets`, `/api/notifications`).
 * Maps UI roles to demo Basic Auth users; all mutating calls send `Authorization: Basic …`.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

/** toBackendUser. */
function toBackendUser(role) {
  const normalized = String(role ?? "").trim().toLowerCase();
  if (normalized === "administrator" || normalized === "admin") {
    return { username: "admin1", password: "1234" };
  }
  if (normalized === "technician" || normalized === "tech") {
    return { username: "tech1", password: "1234" };
  }
  if (normalized === "lecturer") {
    return { username: "lecturer1", password: "1234" };
  }
  return { username: "student1", password: "1234" };
}

/** backendUsernameForUser. */
export function backendUsernameForUser(user) {
  return toBackendUser(user?.role).username;
}

/** Used by admin dashboard and other screens that call Spring Security–protected APIs. */
export function authHeader(user) {
  const creds = toBackendUser(user?.role);
  const token = btoa(`${creds.username}:${creds.password}`);
  return `Basic ${token}`;
}

/** request. */
async function request(path, { method = "GET", body, user } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(user),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) {
        message = data.detail ? `${data.error} ${data.detail}` : data.error;
      } else if (typeof data === "object" && data && !Array.isArray(data)) {
        const first = Object.entries(data).find(([, v]) => typeof v === "string");
        if (first) message = `${first[0]}: ${first[1]}`;
      }
    } catch {
      // ignore parse failures
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const ticketsApi = {
  listTickets(user, filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.q) params.set("q", filters.q);
    const query = params.toString();
    return request(`/api/tickets${query ? `?${query}` : ""}`, { user });
  },
  createTicket(payload, user) {
    return request("/api/tickets", { method: "POST", body: payload, user });
  },
  getTicket(id, user) {
    return request(`/api/tickets/${id}`, { user });
  },
  updateStatus(id, status, user) {
    return request(`/api/tickets/${id}/status`, {
      method: "PUT",
      body: { status, resolutionNotes: null },
      user,
    });
  },
  updateStatusWithNotes(id, status, resolutionNotes, user) {
    return request(`/api/tickets/${id}/status`, {
      method: "PUT",
      body: { status, resolutionNotes },
      user,
    });
  },
  updatePriority(id, priority, user) {
    return request(`/api/tickets/${id}/priority`, {
      method: "PUT",
      body: { priority },
      user,
    });
  },
  assignTechnician(id, technicianUsername, user) {
    return request(`/api/tickets/${id}/assign/${encodeURIComponent(technicianUsername)}`, {
      method: "PUT",
      user,
    });
  },
  addComment(id, message, user) {
    return request(`/api/tickets/${id}/comments`, {
      method: "POST",
      body: { message },
      user,
    });
  },
  editComment(ticketId, commentId, message, user) {
    return request(`/api/tickets/${ticketId}/comments/${commentId}`, {
      method: "PUT",
      body: { message },
      user,
    });
  },
  deleteComment(ticketId, commentId, user) {
    return request(`/api/tickets/${ticketId}/comments/${commentId}`, {
      method: "DELETE",
      user,
    });
  },
  addAttachments(id, imageUrls, user) {
    return request(`/api/tickets/${id}/attachments`, {
      method: "POST",
      body: { imageUrls },
      user,
    });
  },
  listNotifications(user) {
    return request("/api/notifications", { user });
  },
  listActivities(ticketId, user) {
    return request(`/api/tickets/${ticketId}/activities`, { user });
  },
  async exportTicketsCsv(user, filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.q) params.set("q", filters.q);
    const query = params.toString();
    const res = await fetch(`${API_BASE}/api/tickets/export${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: {
        Authorization: authHeader(user),
      },
    });
    if (!res.ok) {
      throw new Error(`Export failed (${res.status})`);
    }
    return res.blob();
  },
};
