import { apiUrl } from "../../../apiBase.js";

/** Helper: buildAuthHeaders. */
export function buildAuthHeaders(user) {
  const headers = { Accept: "application/json" };
  const token = user?.token ?? user?.accessToken;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/** Helper: parseJsonSafe. */
export async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/** apiError. */
export function apiError(res, data, fallback) {
  const err = new Error(data?.message || data?.error || fallback);
  err.status = res.status;
  err.body = data;
  return err;
}

export { apiUrl };
