const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function post(path, body) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the server. Check that the backend is running.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status}).`);
  return data;
}

/**
 * POST /api/auth/signup  body: { name, email, password }
 * POST /api/auth/login   body: { email, password }
 * Success response (200/201): { "token": "...", "user": { "id", "name", "email" } }
 * Failure: non-2xx with { "message": "what went wrong" }
 *   e.g. 401 "Incorrect email or password", 409 "An account with this email already exists"
 */
export const signup = (name, email, password) => post("/api/auth/signup", { name, email, password });
export const login = (email, password) => post("/api/auth/login", { email, password });

export function saveSession({ token, user }) {
  localStorage.setItem("rf-token", token);
  localStorage.setItem("rf-user", JSON.stringify(user));
}