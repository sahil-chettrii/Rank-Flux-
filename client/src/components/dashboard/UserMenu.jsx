import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, clearSession } from "../../api/auth";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const user = getUser();
  const name = user?.name || "Account";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  useEffect(() => {
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("click", close); document.removeEventListener("keydown", esc); };
  }, []);

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="user-menu" ref={ref}>
      <button className="avatar" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Account menu">{initials}</button>
      {open && (
        <div className="user-pop">
          <div className="user-info">
            <strong>{name}</strong>
            {user?.email && <span>{user.email}</span>}
          </div>
          <button onClick={() => { setOpen(false); navigate("/app/settings"); }}>Settings</button>
          <button onClick={logout}>Log out</button>
        </div>
      )}
    </div>
  );
}