import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { getLatestAudit, startAudit, getAudit, setIssueStatus } from "../api/audit";
import "../style/Audit.css";

const SEVERITIES = ["all", "critical", "warning", "info"];
const STATUSES = [["open", "Open"], ["fixed", "Fixed"], ["ignored", "Ignored"], ["all", "All"]];
const scoreColor = (s) => (s >= 80 ? "good" : s >= 65 ? "ok" : "bad");

export default function SiteAudit() {
  const { active } = useOutletContext();
  const [phase, setPhase] = useState("loading"); // loading | empty | running | done | error
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState("");
  const [sev, setSev] = useState("all");
  const [status, setStatus] = useState("open");
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState(new Set());

  /* load the latest audit when the site changes */
  useEffect(() => {
    if (!active) return;
    const c = new AbortController();
    setPhase("loading"); setAudit(null); setError("");
    getLatestAudit(active, c.signal)
      .then((a) => { setAudit(a); setPhase(a.status === "running" ? "running" : a.status === "failed" ? "error" : "done"); if (a.status === "failed") setError(a.error || "The last audit failed."); })
      .catch((e) => { if (e.name === "AbortError") return; if (e.status === 404) setPhase("empty"); else { setError(e.message); setPhase("error"); } });
    return () => c.abort();
  }, [active]);

  /* poll while an audit is running */
  useEffect(() => {
    if (phase !== "running" || !audit?.id) return;
    const c = new AbortController();
    const t = setInterval(() => {
      getAudit(audit.id, c.signal)
        .then((a) => {
          setAudit(a);
          if (a.status === "done") setPhase("done");
          if (a.status === "failed") { setError(a.error || "The audit failed."); setPhase("error"); }
        })
        .catch((e) => { if (e.name !== "AbortError") { setError(e.message); setPhase("error"); } });
    }, 2000);
    return () => { clearInterval(t); c.abort(); };
  }, [phase, audit?.id]);

  const start = async () => {
    setError(""); setPhase("running");
    setAudit({ status: "running", progress: 0, pagesCrawled: 0, issues: [] });
    try {
      const { id } = await startAudit(active);
      setAudit({ id, status: "running", progress: 0, pagesCrawled: 0, issues: [] });
    } catch (e) { setError(e.message); setPhase("error"); }
  };

  const changeStatus = async (issue, next) => {
    const prev = issue.status;
    const update = (s) => setAudit((a) => ({ ...a, issues: a.issues.map((i) => (i.id === issue.id ? { ...i, status: s } : i)) }));
    update(next); // optimistic
    try { await setIssueStatus(audit.id, issue.id, next); }
    catch (e) { update(prev); setError(e.message); }
  };

  const toggle = (id) => setOpenIds((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const issues = audit?.issues || [];
  const open = issues.filter((i) => i.status === "open");
  const counts = { critical: 0, warning: 0, info: 0 };
  open.forEach((i) => { if (counts[i.severity] !== undefined) counts[i.severity]++; });

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues.filter((i) =>
      (sev === "all" || i.severity === sev) &&
      (status === "all" || i.status === status) &&
      (!q || i.title.toLowerCase().includes(q) || (i.category || "").toLowerCase().includes(q))
    );
  }, [issues, sev, status, query]);

  /* ---------- render ---------- */
  const head = (
    <div className="page-head">
      <div><h1>Site audit</h1><p>{active || "No website selected"}</p></div>
      {(phase === "done" || phase === "error") && <button className="primary" onClick={start}>Run new audit</button>}
    </div>
  );

  if (!active) return <div className="page">{head}<div className="empty-state"><h2>Add a website first</h2><p>Use the site switcher in the top bar to add your domain, then run an audit.</p></div></div>;
  if (phase === "loading") return <div className="page">{head}<div className="au-center"><div className="spinner sm" /></div></div>;

  if (phase === "empty") return (
    <div className="page">{head}
      <div className="empty-state">
        <h2>No audit yet for {active}</h2>
        <p>{`We'll crawl your site and list every technical SEO issue, page by page. It can take a few minutes.`}</p>
        <button className="primary" onClick={start}>Start audit</button>
      </div>
    </div>
  );

  if (phase === "running") return (
    <div className="page">{head}
      <div className="card au-progress">
        <h2>Auditing {active}…</h2>
        <div className="bar"><i className="brand" style={{ width: `${Math.max(audit?.progress || 0, 4)}%` }} /></div>
        <p>{audit?.pagesCrawled || 0} pages crawled · {Math.round(audit?.progress || 0)}%</p>
        <small>You can leave this page. The audit keeps running.</small>
      </div>
    </div>
  );

  if (phase === "error" && !audit?.issues?.length) return (
    <div className="page">{head}
      <div className="empty-state"><h2>Something went wrong</h2><p role="alert">{error}</p><button className="primary" onClick={start}>Try again</button></div>
    </div>
  );

  const score = audit?.summary?.score;
  return (
    <div className="page">
      {head}
      {error && <div className="server-err" role="alert">{error}</div>}

      <div className="stats">
        <div className="stat"><span>Audit score</span><b className={score != null ? `c-${scoreColor(score)}` : ""}>{score ?? "–"}</b><small>{audit?.finishedAt ? `Run ${new Date(audit.finishedAt).toLocaleString()}` : ""}</small></div>
        <div className="stat"><span>Pages scanned</span><b>{audit?.summary?.pagesScanned ?? "–"}</b></div>
        <div className="stat"><span>Critical</span><b className="c-bad">{counts.critical}</b><small>open issues</small></div>
        <div className="stat"><span>Warnings</span><b className="c-ok">{counts.warning}</b><small>open issues</small></div>
        <div className="stat"><span>Notices</span><b>{counts.info}</b><small>open issues</small></div>
      </div>

      <section className="card">
        <div className="au-tools">
          <div className="tabs" role="tablist">
            {SEVERITIES.map((s) => (
              <button key={s} role="tab" aria-selected={sev === s} className={sev === s ? "on" : ""} onClick={() => setSev(s)}>
                {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="au-right">
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter">
              {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search issues" aria-label="Search issues" />
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="empty">{issues.length === 0 ? "No issues found. Nice work." : "No issues match these filters."}</p>
        ) : (
          <ul className="au-list">
            {shown.map((i) => {
              const isOpen = openIds.has(i.id);
              return (
                <li key={i.id} className={i.status !== "open" ? "dim" : ""}>
                  <div className="au-row">
                    <button className="au-main" onClick={() => toggle(i.id)} aria-expanded={isOpen}>
                      <span className={`sev ${i.severity}`}>{i.severity}</span>
                      <span className="au-title"><strong>{i.title}</strong><small>{i.category}{i.pages != null && ` · ${i.pages} page${i.pages === 1 ? "" : "s"}`}</small></span>
                    </button>
                    <div className="au-actions">
                      {i.status === "open" ? (
                        <>
                          <button onClick={() => changeStatus(i, "fixed")}>Mark fixed</button>
                          <button onClick={() => changeStatus(i, "ignored")}>Ignore</button>
                        </>
                      ) : (
                        <>
                          <span className="au-tag">{i.status}</span>
                          <button onClick={() => changeStatus(i, "open")}>Reopen</button>
                        </>
                      )}
                    </div>
                  </div>
                  {isOpen && (
                    <div className="au-detail">
                      <p>{i.fix}</p>
                      {i.urls?.length > 0 && (
                        <ul>{i.urls.slice(0, 10).map((u) => <li key={u}><a href={u} target="_blank" rel="noreferrer">{u}</a></li>)}</ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}