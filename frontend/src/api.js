const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export function getApiBaseUrl() {
  return API_BASE_URL.replace(/\/+$/, "");
}

export async function apiGet(path, headers = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers,
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

export async function apiPatch(path, headers = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "PATCH",
    headers,
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}
