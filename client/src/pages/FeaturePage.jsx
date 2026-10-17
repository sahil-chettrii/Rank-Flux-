import { useOutletContext } from "react-router-dom";

// Placeholder screen used until each feature is built in its own step.
export default function FeaturePage({ item }) {
  const { active } = useOutletContext();
  return (
    <div className="page">
      <div className="page-head"><div><h1>{item.label}</h1><p>{active || "No website selected"}</p></div></div>
      <div className="empty-state">
        <h2>No {item.label.toLowerCase()} data yet</h2>
        <p>{item.desc}</p>
      </div>
    </div>
  );
}