import { useBackend } from "../../context/BackendContext";
import "./BackendStatusBadge.css";

/*
  BackendStatusBadge — compact backend health indicator for the Admin header.
   • Green  → Online (shows response time)
   • Yellow → Starting (waking)
   • Red    → Offline
*/
export default function BackendStatusBadge() {
  const ctx = useBackend() || {};
  const { backendReady, backendWaking, backendResponseTime } = ctx;

  let tone = "offline";
  let label = "Offline";
  if (backendWaking) { tone = "starting"; label = "Starting"; }
  else if (backendReady) { tone = "online"; label = "Online"; }

  return (
    <div className={`backend-badge backend-badge-${tone}`} title="Backend status">
      <span className="backend-badge-dot" />
      <span className="backend-badge-label">Backend {label}</span>
      {tone === "online" && typeof backendResponseTime === "number" && (
        <span className="backend-badge-ms">{backendResponseTime} ms</span>
      )}
    </div>
  );
}
