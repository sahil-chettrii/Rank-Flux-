import { useState, useEffect } from "react";
import "../style/Hero.css";

const PERKS = ["Free to try", "No credit card required", "5 analyses per day"];
const DOMAINS = ["example.com", "mystore.com", "yourblog.com", "startup.io"];

const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
);

/* Types and deletes example domains inside the placeholder */
function useTypingPlaceholder(active) {
  const [word, setWord] = useState(0);
  const [chars, setChars] = useState(DOMAINS[0].length);
  const [deleting, setDeleting] = useState(true);

  useEffect(() => {
    if (!active) return;
    const full = DOMAINS[word];
    let delay = deleting ? 45 : 85;
    if (!deleting && chars === full.length) delay = 1800;   // pause on full word
    const t = setTimeout(() => {
      if (!deleting && chars === full.length) setDeleting(true);
      else if (deleting && chars === 0) { setDeleting(false); setWord((word + 1) % DOMAINS.length); }
      else setChars(chars + (deleting ? -1 : 1));
    }, delay);
    return () => clearTimeout(t);
  }, [active, word, chars, deleting]);

  return active ? DOMAINS[word].slice(0, chars) : DOMAINS[0];
}

export default function Hero({ onAnalyze }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const typed = useTypingPlaceholder(!focused && !url);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = url.trim();
    const valid = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/.*)?$/i.test(value);
    if (!valid) {
      setError("Enter a valid website, like example.com");
      return;
    }
    setError("");
    onAnalyze?.(value);
    console.log("Analyze:", value);
  };

  return (
    <section className="hero">
      <div className="hero-inner">
        <span className="badge rise" style={{ "--d": "0ms" }}><i /> AI-Powered SEO Intelligence</span>

        <h1 className="rise" style={{ "--d": "100ms" }}>
          Turn Search Data Into <br />
          Your <span className="grad">Next Growth Move.</span>
        </h1>

        <p className="sub rise" style={{ "--d": "220ms" }}>
          Track rankings, analyze competitors, audit your website, and get
          AI-powered insights to grow your search traffic.
        </p>

        <form className={`url-box rise ${error ? "has-error" : ""}`} style={{ "--d": "340ms" }} onSubmit={handleSubmit} noValidate>
          <svg className="link-ico" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
          </svg>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`Enter your website URL (e.g. ${typed})`}
            aria-label="Website URL"
            aria-invalid={!!error}
          />
          <button type="submit" className="analyze">
            Analyze
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </form>
        {error && <p className="url-error" role="alert">{error}</p>}

        <ul className="perks rise" style={{ "--d": "460ms" }}>
          {PERKS.map((p) => (
            <li key={p}><Check /> {p}</li>
          ))}
        </ul>
      </div>

      <div className="arc" aria-hidden="true" />
    </section>
  );
}