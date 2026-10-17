import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";

const STATS = ["SEO score", "Keywords tracked", "Open issues", "Competitors"];

export default function Overview() {
  const { active, addSite } = useOutletContext();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  if (!active) {
    return (
      <div className="page">
        <div className="empty-state">
          <h1>Add your first website</h1>
          <p>Enter your domain and RankFlux will start tracking it.</p>
          <form onSubmit={(e) => { e.preventDefault(); setError(addSite(value)); }}>
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="example.com" aria-label="Website" />
            <button className="primary" type="submit">Add website</button>
          </form>
          {error && <p className="form-err" role="alert">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Overview</h1><p>{active}</p></div>
        <Link className="primary" to={`/analyze?url=${encodeURIComponent(active)}`}>Run analysis</Link>
      </div>
      <div className="stats">
        {STATS.map((s) => (
          <div key={s} className="stat"><span>{s}</span><b>–</b><small>No data yet</small></div>
        ))}
      </div>
    </div>
  );
}