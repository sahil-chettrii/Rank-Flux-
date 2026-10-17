import { useState, useEffect, useRef } from "react";
import Icon from "./Icon";

export default function SiteSwitcher({ sites, active, addSite, removeSite, setActive }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("click", close); document.removeEventListener("keydown", esc); };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const err = addSite(value);
    setError(err);
    if (!err) { setValue(""); setOpen(false); }
  };

  return (
    <div className="switcher" ref={ref}>
      <button className="switch-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="dot" />
        <span className="switch-name">{active || "Add a website"}</span>
        <Icon name="chev" size={16} />
      </button>

      {open && (
        <div className="switch-menu">
          {sites.map((s) => (
            <div key={s} className={`switch-row ${s === active ? "on" : ""}`}>
              <button onClick={() => { setActive(s); setOpen(false); }}>{s}</button>
              <button className="x" aria-label={`Remove ${s}`} onClick={() => removeSite(s)}>✕</button>
            </div>
          ))}
          <form onSubmit={submit} className="switch-add">
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Add site, e.g. example.com" aria-label="New website" />
            <button type="submit" aria-label="Add site"><Icon name="plus" size={18} /></button>
          </form>
          {error && <p className="switch-err" role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
}