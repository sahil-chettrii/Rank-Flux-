import { useState, useEffect, useMemo } from "react";
import { analyzeSite } from "../api/analyze";
import "../style/Results.css";

const TABS = ["all", "critical", "warning", "info"];
const scoreColor = (s) => (s >= 80 ? "good" : s >= 65 ? "ok" : "bad");

const Empty = ({ children }) => <p className="empty">{children}</p>;

/* ---------- Loading ---------- */
function Loading({ domain }) {
  return (
    <div className="loading">
      <div className="spinner" />
      <h2>Analyzing {domain}</h2>
      <p>This can take up to a minute for larger sites.</p>
    </div>
  );
}

/* ---------- Error ---------- */
function ErrorBox({ message, onRetry, onBack }) {
  return (
    <div className="loading">
      <h2>We couldn't analyze that site</h2>
      <p role="alert">{message}</p>
      <div className="error-actions">
        <button className="ghost" onClick={onRetry}>Try again</button>
        <button className="back" onClick={onBack}>← Enter a different URL</button>
      </div>
    </div>
  );
}

/* ---------- Score ring ---------- */
function ScoreRing({ score }) {
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = setTimeout(() => setShown(score), 100); return () => clearTimeout(t); }, [score]);
  const r = 70, c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} className="ring-bg" />
        <circle cx="90" cy="90" r={r} className={`ring-fg ${scoreColor(score)}`}
          strokeDasharray={c} strokeDashoffset={c - (c * shown) / 100} />
      </svg>
      <div className="ring-num"><b>{score}</b><span>out of 100</span></div>
    </div>
  );
}

/* ---------- Report ---------- */
function Report({ data, onBack }) {
  const [tab, setTab] = useState("all");
  const { categories = [], issues = [], keywords = [], competitors = [], tips = [] } = data;

  const counts = useMemo(() => {
    const c = { all: issues.length, critical: 0, warning: 0, info: 0 };
    issues.forEach((i) => { if (c[i.severity] !== undefined) c[i.severity]++; });
    return c;
  }, [issues]);
  const shownIssues = tab === "all" ? issues : issues.filter((i) => i.severity === tab);

  return (
    <div className="report">
      <div className="report-head">
        <div>
          <button className="back" onClick={onBack}>← Analyze another site</button>
          <h1>SEO report for <span>{data.domain}</span></h1>
        </div>
        <button className="ghost" onClick={() => window.print()}>Download report</button>
      </div>

      <div className="grid top">
        <section className="card score-card">
          <ScoreRing score={data.score ?? 0} />
          {data.summary && <p className="score-text">{data.summary}</p>}
        </section>
        <section className="card cats">
          {categories.length === 0 && <Empty>No category scores returned.</Empty>}
          {categories.map((c) => (
            <div key={c.name} className="cat">
              <div className="cat-row"><span>{c.name}</span><b>{c.score}</b></div>
              <div className="bar"><i className={scoreColor(c.score)} style={{ width: `${c.score}%` }} /></div>
            </div>
          ))}
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Issues to fix</h2>
          <div className="tabs" role="tablist">
            {TABS.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
                {t === "all" ? "All" : t[0].toUpperCase() + t.slice(1)} <em>{counts[t]}</em>
              </button>
            ))}
          </div>
        </div>
        {shownIssues.length === 0 ? <Empty>No issues in this group. Nice work.</Empty> : (
          <ul className="issues">
            {shownIssues.map((i, idx) => (
              <li key={i.id ?? idx}>
                <span className={`sev ${i.severity}`}>{i.severity}</span>
                <div><strong>{i.title}</strong><p>{i.fix}</p></div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid two">
        <section className="card">
          <h2>Top keywords</h2>
          {keywords.length === 0 ? <Empty>No ranking keywords found yet.</Empty> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Keyword</th><th>Position</th><th>Volume</th><th>Change</th></tr></thead>
                <tbody>
                  {keywords.map((k) => (
                    <tr key={k.term}>
                      <td>{k.term}</td><td>#{k.position}</td><td>{k.volume}</td>
                      <td className={k.change > 0 ? "up" : k.change < 0 ? "down" : ""}>
                        {k.change > 0 ? `▲ ${k.change}` : k.change < 0 ? `▼ ${-k.change}` : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Closest competitors</h2>
          {competitors.length === 0 ? <Empty>No competitors found.</Empty> : (
            <ul className="comps">
              {competitors.map((c) => (
                <li key={c.domain}>
                  <div className="cat-row"><span>{c.domain}</span><small>{c.shared} shared keywords</small></div>
                  <div className="bar"><i className="brand" style={{ width: `${c.authority}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card">
        <h2>AI recommendations</h2>
        {tips.length === 0 ? <Empty>No recommendations yet.</Empty> : (
          <div className="tips">
            {tips.map((t) => (
              <article key={t.title}>
                <span className={`impact ${String(t.impact).toLowerCase()}`}>{t.impact} impact</span>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------- Page: loads data from the backend ---------- */
export default function Results({ url, onBack }) {
  const [state, setState] = useState({ status: "loading", data: null, error: "" });
  const [attempt, setAttempt] = useState(0);
  const domain = url.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", data: null, error: "" });
    analyzeSite(url, controller.signal)
      .then((data) => setState({ status: "done", data, error: "" }))
      .catch((err) => { if (err.name !== "AbortError") setState({ status: "error", data: null, error: err.message }); });
    return () => controller.abort();
  }, [url, attempt]);

  return (
    <main className="results">
      {state.status === "loading" && <Loading domain={domain} />}
      {state.status === "error" && <ErrorBox message={state.error} onRetry={() => setAttempt((a) => a + 1)} onBack={onBack} />}
      {state.status === "done" && <Report data={state.data} onBack={onBack} />}
    </main>
  );
}