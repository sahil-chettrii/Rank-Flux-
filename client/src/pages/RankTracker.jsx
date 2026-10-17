import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { getRanks, addKeywords, removeKeyword, refreshRanks } from "../api/rank";
import "../style/Rank.css";

const RANGES = [["7d", 7], ["30d", 30], ["90d", 90]];
const parseTerms = (text) => [...new Set(text.split(/[\n,]/).map((t) => t.trim().toLowerCase()).filter(Boolean))];
const fmtPos = (p) => (p == null ? "Not in top 100" : `#${p}`);

/* ---------- charts (plain SVG, no library) ---------- */
function Spark({ history = [], change }) {
  const pts = history.filter((h) => h.position != null).slice(-30);
  if (pts.length < 2) return <span className="rk-dash">–</span>;
  const w = 90, h = 28;
  const ps = pts.map((p) => p.position);
  const min = Math.min(...ps), max = Math.max(...ps), span = Math.max(max - min, 1);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * w},${((p.position - min) / span) * (h - 6) + 3}`).join(" ");
  return (
    <svg className={`spark ${change > 0 ? "up" : change < 0 ? "down" : ""}`} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={d} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LineChart({ history }) {
  const pts = history.filter((h) => h.position != null);
  if (pts.length === 0) return <p className="empty">No ranking history in this period.</p>;
  const W = 720, H = 260, L = 44, R = 16, T = 16, B = 30;
  const yMax = Math.max(10, Math.ceil(Math.max(...pts.map((p) => p.position)) / 10) * 10);
  const x = (i) => (pts.length === 1 ? (W + L - R) / 2 : L + (i / (pts.length - 1)) * (W - L - R));
  const y = (pos) => T + ((pos - 1) / (yMax - 1)) * (H - T - B);   // position 1 is at the top
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.position)}`).join(" ");
  const ticks = [1, Math.round(yMax / 3), Math.round((yMax * 2) / 3), yMax];
  const fmt = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="rk-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Position history chart">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" className="axis">#{t}</text>
          </g>
        ))}
        <path d={path} className="line" />
        {pts.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.position)} r="4" className="dot"><title>{`${fmt(p.date)}: #${p.position}`}</title></circle>
        ))}
        <text x={L} y={H - 8} className="axis">{fmt(pts[0].date)}</text>
        <text x={W - R} y={H - 8} textAnchor="end" className="axis">{fmt(pts[pts.length - 1].date)}</text>
      </svg>
    </div>
  );
}

/* ---------- add keywords form ---------- */
function AddForm({ onAdd, busy, big }) {
  const [text, setText] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const terms = parseTerms(text);
    if (!terms.length) return;
    if (await onAdd(terms)) setText("");
  };
  return (
    <form className={`rk-add ${big ? "big" : ""}`} onSubmit={submit}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add keywords, separated by commas" aria-label="Keywords to track" disabled={busy} />
      <button className="primary" type="submit" disabled={busy || !text.trim()}>{busy ? "Adding…" : "Add"}</button>
    </form>
  );
}

/* ---------- page ---------- */
export default function RankTracker() {
  const { active } = useOutletContext();
  const [data, setData] = useState({ keywords: [], updatedAt: null });
  const [phase, setPhase] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [range, setRange] = useState(30);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "position", dir: "asc" });

  useEffect(() => {
    if (!active) return;
    const c = new AbortController();
    setPhase("loading"); setError(""); setSelectedId(null);
    getRanks(active, c.signal)
      .then((d) => { setData({ keywords: d.keywords || [], updatedAt: d.updatedAt }); setPhase("ready"); })
      .catch((e) => { if (e.name !== "AbortError") { setError(e.message); setPhase("error"); } });
    return () => c.abort();
  }, [active]);

  const keywords = data.keywords;

  const add = async (terms) => {
    const existing = new Set(keywords.map((k) => k.term.toLowerCase()));
    const fresh = terms.filter((t) => !existing.has(t));
    if (!fresh.length) { setError("Those keywords are already tracked."); return false; }
    setBusy(true); setError("");
    try {
      const res = await addKeywords(active, fresh);
      setData((d) => ({ ...d, keywords: [...d.keywords, ...(res.keywords || [])] }));
      return true;
    } catch (e) { setError(e.message); return false; }
    finally { setBusy(false); }
  };

  const remove = async (k) => {
    if (!window.confirm(`Stop tracking "${k.term}"?`)) return;
    const before = data;
    setData((d) => ({ ...d, keywords: d.keywords.filter((x) => x.id !== k.id) }));
    try { await removeKeyword(k.id); }
    catch (e) { setData(before); setError(e.message); }
  };

  const refresh = async () => {
    setRefreshing(true); setError("");
    try { const d = await refreshRanks(active); setData({ keywords: d.keywords || [], updatedAt: d.updatedAt }); }
    catch (e) { setError(e.message); }
    finally { setRefreshing(false); }
  };

  const stats = useMemo(() => {
    const ranked = keywords.filter((k) => k.position != null);
    return {
      tracked: keywords.length,
      avg: ranked.length ? (ranked.reduce((s, k) => s + k.position, 0) / ranked.length).toFixed(1) : "–",
      top3: ranked.filter((k) => k.position <= 3).length,
      top10: ranked.filter((k) => k.position <= 10).length,
    };
  }, [keywords]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = keywords.filter((k) => !q || k.term.toLowerCase().includes(q));
    const val = (k) => (sort.key === "term" ? k.term : sort.key === "change" ? k.change ?? 0 : k.position ?? 9999);
    return [...list].sort((a, b) => {
      const A = val(a), B = val(b);
      const r = typeof A === "string" ? A.localeCompare(B) : A - B;
      return sort.dir === "asc" ? r : -r;
    });
  }, [keywords, query, sort]);

  const sortBy = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "change" ? "desc" : "asc" }));
  const arrow = (key) => (sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "");

  const selected = keywords.find((k) => k.id === selectedId) || rows[0];
  const history = useMemo(() => {
    if (!selected) return [];
    const cutoff = Date.now() - range * 864e5;
    return (selected.history || []).filter((h) => new Date(h.date).getTime() >= cutoff);
  }, [selected, range]);

  const head = (
    <div className="page-head">
      <div><h1>Rank tracker</h1><p>{active || "No website selected"}</p></div>
      {phase === "ready" && keywords.length > 0 && (
        <button className="ghost" onClick={refresh} disabled={refreshing}>{refreshing ? "Checking…" : "Refresh positions"}</button>
      )}
    </div>
  );

  if (!active) return <div className="page">{head}<div className="empty-state"><h2>Add a website first</h2><p>Use the site switcher in the top bar to add your domain, then add keywords to track.</p></div></div>;
  if (phase === "loading") return <div className="page">{head}<div className="au-center"><div className="spinner sm" /></div></div>;
  if (phase === "error") return <div className="page">{head}<div className="empty-state"><h2>Couldn't load your keywords</h2><p role="alert">{error}</p><button className="primary" onClick={() => window.location.reload()}>Try again</button></div></div>;

  if (keywords.length === 0) return (
    <div className="page">{head}
      <div className="empty-state">
        <h2>Track your first keywords</h2>
        <p>Add the search terms you want to rank for. We'll check where {active} appears and show how it changes over time.</p>
        <AddForm onAdd={add} busy={busy} big />
        {error && <p className="form-err" role="alert">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="page">
      {head}
      {error && <div className="server-err" role="alert">{error}</div>}

      <div className="stats">
        <div className="stat"><span>Keywords tracked</span><b>{stats.tracked}</b></div>
        <div className="stat"><span>Average position</span><b>{stats.avg}</b></div>
        <div className="stat"><span>In top 3</span><b>{stats.top3}</b></div>
        <div className="stat"><span>In top 10</span><b>{stats.top10}</b><small>{data.updatedAt ? `Updated ${new Date(data.updatedAt).toLocaleString()}` : ""}</small></div>
      </div>

      {selected && (
        <section className="card">
          <div className="card-head">
            <h2>{selected.term}</h2>
            <div className="tabs" role="tablist">
              {RANGES.map(([l, d]) => (
                <button key={l} role="tab" aria-selected={range === d} className={range === d ? "on" : ""} onClick={() => setRange(d)}>{l}</button>
              ))}
            </div>
          </div>
          <LineChart history={history} />
        </section>
      )}

      <section className="card">
        <div className="rk-tools">
          <AddForm onAdd={add} busy={busy} />
          <input type="search" className="rk-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search keywords" aria-label="Search keywords" />
        </div>
        <div className="table-wrap">
          <table className="rk-table">
            <thead>
              <tr>
                <th><button onClick={() => sortBy("term")}>Keyword{arrow("term")}</button></th>
                <th><button onClick={() => sortBy("position")}>Position{arrow("position")}</button></th>
                <th><button onClick={() => sortBy("change")}>Change{arrow("change")}</button></th>
                <th>Volume</th>
                <th>Trend</th>
                <th><span className="sr">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((k) => (
                <tr key={k.id} className={selected?.id === k.id ? "sel" : ""} onClick={() => setSelectedId(k.id)}>
                  <td className="rk-term">{k.term}</td>
                  <td>{fmtPos(k.position)}</td>
                  <td className={k.change > 0 ? "rk-up" : k.change < 0 ? "rk-down" : ""}>
                    {k.change > 0 ? `▲ ${k.change}` : k.change < 0 ? `▼ ${-k.change}` : "–"}
                  </td>
                  <td>{k.volume ?? "–"}</td>
                  <td><Spark history={k.history} change={k.change} /></td>
                  <td><button className="rk-x" aria-label={`Remove ${k.term}`} onClick={(e) => { e.stopPropagation(); remove(k); }}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="empty">No keywords match your search.</p>}
        </div>
      </section>
    </div>
  );
}