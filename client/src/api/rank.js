import { request } from "./client";


export const getRanks = (site, signal) => request(`/api/rank?site=${encodeURIComponent(site)}`, { signal });
export const addKeywords = (site, terms) => request("/api/rank/keywords", { method: "POST", body: { site, terms } });
export const removeKeyword = (id) => request(`/api/rank/keywords/${id}`, { method: "DELETE" });
export const refreshRanks = (site) => request("/api/rank/refresh", { method: "POST", body: { site } });