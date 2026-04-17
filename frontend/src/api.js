const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export function getApiBaseUrl() {
  return API_BASE_URL.replace(/\/+$/, "");
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "object" && body?.message
        ? body.message
        : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
}

export async function apiGet(path, headers = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, { headers });
  return parseResponse(response);
}

export async function apiPost(path, data, headers = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
  return parseResponse(response);
}

export async function apiPatch(path, headers = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "PATCH",
    headers,
  });
  return parseResponse(response);
}
