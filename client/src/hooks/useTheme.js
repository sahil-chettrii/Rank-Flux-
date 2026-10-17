import { useState, useEffect } from "react";

export default function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("rf-theme") || "dark");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("rf-theme", theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}