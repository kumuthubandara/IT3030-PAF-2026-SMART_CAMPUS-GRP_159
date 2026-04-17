/**
 * API origin without trailing slash.
 * - If `VITE_API_BASE_URL` is set, it wins (production or custom dev).
 * - In Vite dev without env, use same-origin empty string so `/api/*` is proxied to Spring Boot.
 * - Production build without env falls back to localhost (adjust for your deploy).
 */
export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv != null && String(fromEnv).trim() !== "") {
    return String(fromEnv).trim().replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "";
  }
  return "http://localhost:8081";
}

/** @param {string} path e.g. `/api/resources` */
export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${p}` : p;
}
