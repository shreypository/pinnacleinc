import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./WakeOverlay.css";

/*
  WakeOverlay — premium full-screen "Starting Pinnacle Services" experience
  shown while the Render backend is waking. Particles, glowing rings, cycling
  stage messages, and an estimated countdown. Closes instantly when the
  backend is ready (controlled by `show`). After the soft timeout it shows a
  reassuring message + Retry (Step 10).
*/

const STAGES = [
  "Checking servers…",
  "Connecting to database…",
  "Starting services…",
  "Synchronizing systems…"
];

const ESTIMATE = 15; // seconds shown in the countdown

export default function WakeOverlay({ show, timedOut, onRetry }) {
  const [stage, setStage] = useState(0);
  const [remaining, setRemaining] = useState(ESTIMATE);
  const startedRef = useRef(0);

  // Drive the stage rotation + countdown only while visible
  useEffect(() => {
    if (!show) { setStage(0); setRemaining(ESTIMATE); return; }
    startedRef.current = Date.now();

    const stageTimer = setInterval(() => {
      setStage((s) => (s + 1) % STAGES.length);
    }, 2600);

    const countTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedRef.current) / 1000);
      setRemaining(Math.max(0, ESTIMATE - elapsed));
    }, 1000);

    return () => { clearInterval(stageTimer); clearInterval(countTimer); };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="wake-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="status"
          aria-live="polite"
        >
          {/* Ambient particles */}
          <div className="wake-particles" aria-hidden="true">
            {[...Array(18)].map((_, i) => <span key={i} />)}
          </div>

          <motion.div
            className="wake-card"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
          >
            {/* Glowing rings */}
            <div className="wake-rings" aria-hidden="true">
              <span className="wake-ring wake-ring-1" />
              <span className="wake-ring wake-ring-2" />
              <span className="wake-ring wake-ring-3" />
              <span className="wake-core" />
            </div>

            <h2 className="wake-title">Starting Pinnacle Services</h2>

            {!timedOut ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={stage}
                    className="wake-stage"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {STAGES[stage]}
                  </motion.p>
                </AnimatePresence>

                <div className="wake-progress" aria-hidden="true">
                  <motion.div
                    className="wake-progress-bar"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: ESTIMATE, ease: "easeInOut" }}
                  />
                </div>

                <p className="wake-eta">
                  Estimated wait: <span className="wake-count">{remaining}</span>s
                </p>
              </>
            ) : (
              <>
                <p className="wake-stage">
                  We&apos;re still starting our systems.<br />Please wait a moment.
                </p>
                <button className="wake-retry" onClick={onRetry}>Retry now</button>
              </>
            )}

            <p className="wake-note">
              Our servers rest during quiet hours — this only happens on the first visit.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
