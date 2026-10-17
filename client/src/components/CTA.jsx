import { Link } from "react-router-dom";
import "../style/CTA.css";

export default function CTA() {
  // scroll back to the hero and focus the URL box
  const goToAnalyzer = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => document.querySelector(".url-box input")?.focus({ preventScroll: true }), 500);
  };

  return (
    <section className="cta-section">
      <div className="cta-card">
        <h2>Find out where your site <br />is losing search traffic.</h2>
        <p>Paste your URL and get a full SEO report in about a minute. No credit card needed.</p>
        <div className="cta-actions">
          <button className="cta-main" onClick={goToAnalyzer}>
            Analyze your site
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <Link className="cta-alt" to="/app">Open dashboard</Link>
        </div>
      </div>
    </section>
  );
}