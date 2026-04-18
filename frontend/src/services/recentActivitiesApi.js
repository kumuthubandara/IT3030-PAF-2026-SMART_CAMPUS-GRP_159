import { apiUrl } from "../apiBase.js";

/**
 * Recent activity feed is scoped by role on the server (student/lecturer = own email;
 * technician = equipment & contact-related; administrator = all).
 * @param {number} limit
 * @param {Record<string, unknown> | null | undefined} user
 */
export function recentActivitiesListUrl(limit, user) {
  const params = new URLSearchParams({ limit: String(limit) });
  const email = String(user?.email ?? "").trim();
  const role = String(user?.role ?? "").trim();
  if (email) params.set("email", email);
  if (role) params.set("role", role);
  return apiUrl(`/api/admin/activities?${params.toString()}`);
}
