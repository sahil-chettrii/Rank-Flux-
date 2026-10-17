import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { NAV } from "../../config/nav";
import useSites from "../../hooks/useSites";
import Icon from "./Icon";
import SiteSwitcher from "./SiteSwitcher";
import "../../style/Dashboard.css";

export default function DashboardLayout({ theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const siteState = useSites();
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]); // close drawer after navigating

  return (
    <div className="dash">
      <aside className={`side ${menuOpen ? "open" : ""}`}>
        <a href="/" className="side-logo" aria-label="RankFlux home">
          <svg width="32" height="32" viewBox="0 0 44 44" fill="none"><defs><linearGradient id="dg" x1="6" y1="40" x2="38" y2="4"><stop stopColor="#2f6bff" /><stop offset="1" stopColor="#7c5cff" /></linearGradient></defs><path d="M22 4 40 40H29L22 25 15 40H4z" fill="url(#dg)" /><path d="M22 4l8 17-8 6z" fill="#fff" opacity=".9" /></svg>
          <span>Rank<b>Flux</b></span>
        </a>
        <nav aria-label="Dashboard">
          {NAV.map((n) => (
            <NavLink key={n.path} to={n.path} className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
              <Icon name={n.icon} /> {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

      <div className="dash-main">
        <header className="topbar">
          <button className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Icon name="menu" /></button>
          <SiteSwitcher {...siteState} />
          <div className="topbar-right">
            <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </header>
        <main className="dash-content">
          <Outlet context={siteState} />
        </main>
      </div>
    </div>
  );
}