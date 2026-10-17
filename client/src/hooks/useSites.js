import { useState, useEffect } from "react";

const KEY = "rf-sites";
const clean = (v) => v.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "").toLowerCase();
const valid = (d) => /^([a-z0-9-]+\.)+[a-z]{2,}$/.test(d);

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { sites: [], active: null }; }
  catch { return { sites: [], active: null }; }
}

export default function useSites() {
  const [state, setState] = useState(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }, [state]);

  const addSite = (input) => {
    const d = clean(input);
    if (!valid(d)) return "Enter a valid website, like example.com";
    if (state.sites.includes(d)) return "That site is already added";
    setState({ sites: [...state.sites, d], active: d });
    return "";
  };
  const removeSite = (d) => {
    const sites = state.sites.filter((s) => s !== d);
    setState({ sites, active: state.active === d ? sites[0] ?? null : state.active });
  };
  const setActive = (d) => setState({ ...state, active: d });

  return { sites: state.sites, active: state.active, addSite, removeSite, setActive };
}