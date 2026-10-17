const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * POST {API_URL}/api/analyze   body: { "url": "example.com" }
 *
 * Expected JSON response:
 * {
 *   "domain": "example.com",
 *   "score": 72,                                   // 0-100
 *   "summary": "Short sentence about the result",  // optional
 *   "categories": [ { "name": "Technical SEO", "score": 81 } ],
 *   "issues": [ { "id": 1, "severity": "critical" | "warning" | "info",
 *                 "title": "...", "fix": "..." } ],
 *   "keywords": [ { "term": "...", "position": 4, "volume": "12.1K", "change": 3 } ],
 *   "competitors": [ { "domain": "...", "shared": 184, "authority": 78 } ],
 *   "tips": [ { "impact": "High" | "Medium" | "Low", "title": "...", "body": "..." } ]
 * }
 * Every list may be empty; the UI shows an empty message.
 * On failure return a non-200 status with { "message": "what went wrong" }.
 */
export async function analyzeSite(url, signal) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Can't reach the server. Check that the backend is running.");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message || `Request failed (${res.status}).`);
  return body;
}