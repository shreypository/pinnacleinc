/*
  backendStatus.js — Render cold-start wake-up manager + central API interceptor.
  ───────────────────────────────────────────────────────────────────────────
  This is a framework-agnostic module (no React) so it can be the single choke
  point for ALL backend traffic. The React layer (BackendProvider) subscribes
  to state changes here and renders the wake-up overlay.

  Key ideas:
   • One source of truth for backend health + base URL.
   • apiFetch() wraps fetch and guarantees the backend is awake before the
     request goes out (Action Guard + Interceptor). No per-call duplication.
   • Successful "online" state is cached for 10 minutes → we do NOT ping before
     every request (Render only sleeps after ~15 min, so a fresh <10-min cache
     is safe). After the cache expires, the next call re-verifies.
   • Concurrent calls share a single in-flight wake loop (no ping storms).
*/

// Single source of truth for the API base (re-exported by services/api.js).
export const API = "https://pinnacle-backend-pq2c.onrender.com";
export const HEALTH_PATH = "/api/health";

const CACHE_TTL_MS    = 10 * 60 * 1000; // re-verify health at most every 10 min
const ATTEMPT_TIMEOUT = 28000;          // per single health attempt (cold start can be ~30s)
const SOFT_TIMEOUT    = 30000;          // after this, overlay shows "taking longer" + retry
const HARD_TIMEOUT    = 90000;          // give up waking after this
const POLL_GAP        = 1500;           // pause between wake attempts

const state = {
  online: null,        // null = unknown, true = awake, false = unreachable
  waking: false,       // a blocking wake is in progress (drives the overlay)
  timedOut: false,     // soft-timeout reached (show retry)
  responseTime: null,  // ms of last successful health check
  checkedAt: 0         // timestamp of last health check
};

const listeners = new Set();
export const getState = () => ({ ...state });
const emit = () => {
  const snap = getState();
  listeners.forEach((fn) => { try { fn(snap); } catch { /* ignore listener errors */ } });
};
export const subscribe = (fn) => {
  listeners.add(fn);
  fn(getState());               // push current state immediately
  return () => listeners.delete(fn);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => Date.now();

/* ── Single health probe (Step 2 / Step 9 consumer) ── */
export async function checkBackendHealth(timeoutMs = ATTEMPT_TIMEOUT) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const start = (typeof performance !== "undefined" ? performance.now() : now());
  try {
    const res = await fetch(`${API}${HEALTH_PATH}`, {
      method: "GET",
      signal: ctrl.signal,
      cache: "no-store"
    });
    const responseTime = Math.round((typeof performance !== "undefined" ? performance.now() : now()) - start);
    const online = res.ok;
    state.online = online;
    state.responseTime = online ? responseTime : null;
    state.checkedAt = now();
    emit();
    return online ? { online: true, responseTime } : { online: false };
  } catch {
    // network error / abort / timeout → unreachable (still asleep or no network)
    state.online = false;
    state.checkedAt = now();
    emit();
    return { online: false };
  } finally {
    clearTimeout(timer);
  }
}

/* ── Wake loop: poll health until online or hard timeout ── */
let inFlight = null;

function runWakeLoop() {
  const start = now();
  const loop = (async () => {
    state.timedOut = false;
    while (now() - start < HARD_TIMEOUT) {
      const remaining = HARD_TIMEOUT - (now() - start);
      const r = await checkBackendHealth(Math.min(ATTEMPT_TIMEOUT, remaining));
      if (r.online) {
        state.waking = false;
        state.timedOut = false;
        emit();
        return { online: true, responseTime: r.responseTime };
      }
      if (!state.timedOut && now() - start >= SOFT_TIMEOUT) {
        state.timedOut = true;
        emit();
      }
      await sleep(POLL_GAP);
    }
    state.waking = false;
    state.online = false;
    emit();
    return { online: false, timedOut: true };
  })();
  loop.finally(() => { if (inFlight === loop) inFlight = null; });
  return loop;
}

/*
  ensureBackendAwake — the Action Guard.
   • Fresh + online (within cache TTL) → resolves instantly, no network call.
   • Otherwise verifies/wakes the backend; `blocking` controls whether the
     overlay is shown (true for user actions, false for silent background warm).
*/
export function ensureBackendAwake({ blocking = true, force = false } = {}) {
  if (!force && state.online === true && (now() - state.checkedAt) < CACHE_TTL_MS) {
    return Promise.resolve({ online: true, responseTime: state.responseTime });
  }
  if (blocking && !state.waking) {
    state.waking = true;
    emit();
  }
  if (!inFlight) inFlight = runWakeLoop();
  return inFlight;
}

/* Retry button handler (Step 10) — force a fresh wake attempt. */
export function retryWake() {
  state.timedOut = false;
  state.waking = true;
  emit();
  return ensureBackendAwake({ blocking: true, force: true });
}

/* Proactive silent warm at app startup (Step 3) — never shows the overlay. */
export function warmBackend() {
  return ensureBackendAwake({ blocking: false });
}

/*
  apiFetch — central interceptor (Step 6 + Step 7).
  Drop-in replacement for fetch() that first guarantees the backend is awake.
  Returns the native Response, so existing `.then(handle)` / `.then(r => r.json())`
  / `.blob()` consumers keep working unchanged.

  opts3.silent = true → background request (e.g. visitor counter): warms the
  instance without showing the overlay.
*/
export async function apiFetch(url, options = {}, { silent = false } = {}) {
  await ensureBackendAwake({ blocking: !silent });
  return fetch(url, options);
}
