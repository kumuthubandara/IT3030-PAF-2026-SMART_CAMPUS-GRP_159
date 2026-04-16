const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function toBackendUser(role) {
  const normalized = String(role ?? "").trim().toLowerCase();
  if (normalized === "administrator" || normalized === "admin") {
    return { username: "admin1", password: "1234" };
  }
  if (normalized === "technician" || normalized === "tech") {
    return { username: "tech1", password: "1234" };
  }
  return { username: "student1", password: "1234" };
}

export function backendUsernameForUser(user) {
  return toBackendUser(user?.role).username;
}

function authHeader(user) {
  const creds = toBackendUser(user?.role);
  const token = btoa(`${creds.username}:${creds.password}`);
  return `Basic ${token}`;
}

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
      if (data?.error) message = data.error;
    } catch {
      // ignore parse failures
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const ticketsApi = {
  listTickets(user) {
    return request("/api/tickets", { user });
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
      body: { status },
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
};
