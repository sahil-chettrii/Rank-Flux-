import { request } from "./client";

export const getLatestAudit = (site, signal) => request(`/api/audit/latest?site=${encodeURIComponent(site)}`, { signal });
export const startAudit = (site) => request("/api/audit", { method: "POST", body: { site } });
export const getAudit = (id, signal) => request(`/api/audit/${id}`, { signal });
export const setIssueStatus = (auditId, issueId, status) =>
  request(`/api/audit/${auditId}/issues/${issueId}`, { method: "PATCH", body: { status } });