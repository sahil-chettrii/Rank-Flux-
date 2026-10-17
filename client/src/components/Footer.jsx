import "../style/Footer.css";

const COLUMNS = [
  { title: "Product", links: ["Rank tracker", "Competitor analysis", "Site audit", "AI insights"] },
  { title: "Solutions", links: ["Agencies", "E-commerce", "Publishers"] },
  { title: "Resources", links: ["Blog", "Help center", "API docs"] },
  { title: "Company", links: ["About", "Pricing", "Contact", "Privacy policy", "Terms of service"] },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="/" className="logo" aria-label="RankFlux home">
            <svg width="34" height="34" viewBox="0 0 44 44" fill="none"><defs><linearGradient id="fg" x1="6" y1="40" x2="38" y2="4"><stop stopColor="#2f6bff" /><stop offset="1" stopColor="#7c5cff" /></linearGradient></defs><path d="M22 4 40 40H29L22 25 15 40H4z" fill="url(#fg)" /><path d="M22 4l8 17-8 6z" fill="#fff" opacity=".9" /></svg>
            <span>Rank<b>Flux</b></span>
          </a>
          <p>Turn search data into your next growth move.</p>
        </div>

        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3>{c.title}</h3>
            <ul>
              {c.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </nav>
        ))}
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} RankFlux. All rights reserved.</span>
        <span className="status"><i /> All systems operational</span>
      </div>
    </footer>
  );
}