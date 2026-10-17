import { clearSession } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Shared request helper for every logged-in API call.
 * - sends the saved token as "Authorization: Bearer <token>"
 * - on 401 (expired or invalid token) it logs the user out and goes to /login
 * - other errors throw Error(message) with .status set
 */
export async function request(path, { method = "GET", body, signal } = {}) {
  const token = localStorage.getItem("rf-token");
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Can't reach the server. Check that the backend is running.");
  }

  if (res.status === 401) {
    clearSession();
    window.location.assign("/login");
    throw new Error("Session expired. Please log in again.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data;
}