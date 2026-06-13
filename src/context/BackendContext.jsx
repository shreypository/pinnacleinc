import { createContext, useContext, useEffect, useState } from "react";
import {
  subscribe, getState, warmBackend, checkBackendHealth, retryWake
} from "../services/backendStatus";
import WakeOverlay from "../components/backend/WakeOverlay";

/*
  BackendProvider — mirrors the framework-agnostic backendStatus state into
  React, proactively warms the Render instance on startup, re-verifies health
  every 10 minutes (only while the tab is visible), and renders the wake-up
  overlay whenever a blocking wake is in progress.
*/
const BackendContext = createContext(null);

const RECHECK_MS = 10 * 60 * 1000; // Step 11: recheck every 10 minutes

export function BackendProvider({ children }) {
  const [status, setStatus] = useState(getState());

  // Subscribe to the shared backend status
  useEffect(() => subscribe(setStatus), []);

  // Proactive silent warm on startup (Step 3) — no overlay
  useEffect(() => { warmBackend(); }, []);

  // Periodic lightweight re-check (Step 11), only when the tab is visible
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") checkBackendHealth();
    };
    const id = setInterval(tick, RECHECK_MS);
    // Re-verify immediately when the user returns to a backgrounded tab
    const onVis = () => { if (document.visibilityState === "visible") checkBackendHealth(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const value = {
    backendReady: status.online === true && !status.waking,
    backendWaking: status.waking,
    backendOffline: status.online === false && !status.waking,
    backendResponseTime: status.responseTime,
    timedOut: status.timedOut,
    retry: retryWake
  };

  return (
    <BackendContext.Provider value={value}>
      {children}
      <WakeOverlay
        show={status.waking}
        timedOut={status.timedOut}
        onRetry={retryWake}
      />
    </BackendContext.Provider>
  );
}

export const useBackend = () => useContext(BackendContext);
