import { useState, useEffect, useRef } from "react";
import "../style/Navbar.css";

const MENUS = [
  { label: "Product", items: [
    ["Rank tracker", "Watch keyword positions change daily."],
    ["Competitor analysis", "See what rivals rank for and why."],
    ["Site audit", "Find and fix technical issues."],
    ["AI insights", "Get a clear next step for your traffic."],
  ]},
  { label: "Solutions", items: [
    ["Agencies", "Manage every client in one place."],
    ["E-commerce", "Grow product and category traffic."],
    ["Publishers", "Find topics your readers search for."],
  ]},
  { label: "Resources", items: [
    ["Blog", "SEO guides and product updates."],
    ["Help center", "Answers and setup walkthroughs."],
    ["API docs", "Pull your data into other tools."],
  ]},
];

const Chevron = () => (
  <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);

const Logo = () => (
  <a href="/" className="logo" aria-label="RankFlux home">
    <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
      <defs><linearGradient id="lg" x1="6" y1="40" x2="38" y2="4"><stop stopColor="#2f6bff" /><stop offset="1" stopColor="#7c5cff" /></linearGradient></defs>
      <path d="M22 4 40 40H29L22 25 15 40H4z" fill="url(#lg)" />
      <path d="M22 4l8 17-8 6z" fill="#fff" opacity=".9" />
    </svg>
    <span>Rank<b>Flux</b></span>
  </a>
);

export default function Navbar({ theme, onToggleTheme }) {
  const [openMenu, setOpenMenu] = useState(null);   // which dropdown is open
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const linksRef = useRef(null);

  // add border after scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close dropdown on outside click / Escape
  useEffect(() => {
    const onClick = (e) => { if (!linksRef.current?.contains(e.target)) setOpenMenu(null); };
    const onKey = (e) => { if (e.key === "Escape") { setOpenMenu(null); setMobileOpen(false); } };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, []);

  // lock page scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  return (
    <>
      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <Logo />

          <ul className="nav-links" ref={linksRef}>
            {MENUS.map((m) => (
              <li
                key={m.label}
                className={`nav-item ${openMenu === m.label ? "open" : ""}`}
                onMouseEnter={() => window.matchMedia("(hover:hover)").matches && setOpenMenu(m.label)}
                onMouseLeave={() => window.matchMedia("(hover:hover)").matches && setOpenMenu(null)}
              >
                <button
                  className="nav-link"
                  aria-expanded={openMenu === m.label}
                  onClick={() => setOpenMenu(openMenu === m.label ? null : m.label)}
                >
                  {m.label} <Chevron />
                </button>
                <div className="dropdown">
                  {m.items.map(([title, desc]) => (
                    <a key={title} href="#">
                      <strong>{title}</strong>
                      <span>{desc}</span>
                    </a>
                  ))}
                </div>
              </li>
            ))}
            <li><a className="nav-link" href="#pricing">Pricing</a></li>
          </ul>

          <div className="nav-right">
            <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg>
              )}
            </button>
            <a className="login" href="/login">Log in</a>
            <a className="cta" href="/signup">Get Started</a>
            <button className="icon-btn burger" aria-label="Open menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <nav className={`drawer ${mobileOpen ? "open" : ""}`} aria-label="Mobile">
        {MENUS.map((m) => (
          <details key={m.label}>
            <summary>{m.label}</summary>
            {m.items.map(([title]) => <a key={title} href="#">{title}</a>)}
          </details>
        ))}
        <a className="plain" href="#pricing">Pricing</a>
        <a className="plain" href="/login">Log in</a>
        <a className="cta" href="/signup">Get Started</a>
      </nav>
    </>
  );
}