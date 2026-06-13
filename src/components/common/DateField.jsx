import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaRegCalendarAlt } from "react-icons/fa";
import "./DateField.css";

/*
  DateField — premium animated calendar picker (no native input).
  Shared by Flights (departure/return) and Hotels (check-in/check-out).

  Props:
    label        — field label
    value        — "yyyy-mm-dd" | ""
    min          — earliest selectable "yyyy-mm-dd" (default today)
    onChange     — (str) => void
    placeholder  — text when empty (default "Select date")
    disabled     — boolean
    align        — "left" | "right" (popover alignment, default "left")
*/

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

const pad = (n) => String(n).padStart(2, "0");
const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayISO = () => {
  const t = new Date();
  return toISO(t.getFullYear(), t.getMonth(), t.getDate());
};

const parseISO = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
};

const prettyDate = (s) => {
  const p = parseISO(s);
  if (!p) return "";
  return new Date(p.y, p.m, p.d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
};
const weekdayName = (s) => {
  const p = parseISO(s);
  if (!p) return "";
  return new Date(p.y, p.m, p.d).toLocaleDateString("en-IN", { weekday: "long" });
};

export default function DateField({
  label, value, min, onChange,
  placeholder = "Select date", disabled = false, align = "left"
}) {
  const [open, setOpen] = useState(false);
  const minISO = min || todayISO();

  // Which month the calendar is showing
  const initialView = useMemo(() => {
    const base = parseISO(value) || parseISO(minISO) || parseISO(todayISO());
    return { y: base.y, m: base.m };
  }, [value, minISO]);
  const [view, setView] = useState(initialView);

  const wrapRef = useRef(null);

  // Re-sync the visible month when opening
  useEffect(() => {
    if (open) setView(initialView);
  }, [open, initialView]);

  // Close on outside click / Escape
  useEffect(() => {
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Build the 6-row grid for the current view month
  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1).getDay();    // 0=Sun
    const days = new Date(view.y, view.m + 1, 0).getDate(); // days in month
    const out = [];
    for (let i = 0; i < first; i++) out.push(null);
    for (let d = 1; d <= days; d++) out.push(d);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [view]);

  const isDisabled = (d) => d && toISO(view.y, view.m, d) < minISO;
  const isSelected = (d) => d && value && toISO(view.y, view.m, d) === value;
  const isToday    = (d) => d && toISO(view.y, view.m, d) === todayISO();

  const canPrev = () => {
    const minP = parseISO(minISO);
    return view.y > minP.y || (view.y === minP.y && view.m > minP.m);
  };

  const go = (delta) => {
    setView((v) => {
      const m = v.m + delta;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });
  };

  const pick = (d) => {
    if (!d || isDisabled(d)) return;
    onChange(toISO(view.y, view.m, d));
    setOpen(false);
  };

  return (
    <div className={`df ${disabled ? "df-disabled" : ""}`} ref={wrapRef}>
      <button
        type="button"
        className={`df-trigger ${open ? "df-trigger-open" : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
      >
        <span className="df-label">{label}</span>
        {value ? (
          <span className="df-value">
            <strong>{prettyDate(value)}</strong>
            <em>{weekdayName(value)}</em>
          </span>
        ) : (
          <span className="df-empty">
            <FaRegCalendarAlt className="df-empty-icon" /> {placeholder}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={`df-pop df-pop-${align}`}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="df-head">
              <button
                type="button"
                className="df-nav"
                onClick={() => go(-1)}
                disabled={!canPrev()}
                aria-label="Previous month"
              >
                <FaChevronLeft />
              </button>
              <span className="df-month">{MONTHS[view.m]} {view.y}</span>
              <button type="button" className="df-nav" onClick={() => go(1)} aria-label="Next month">
                <FaChevronRight />
              </button>
            </div>

            <div className="df-dow">
              {DOW.map((d, i) => <span key={i}>{d}</span>)}
            </div>

            <div className="df-grid">
              {cells.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  className={[
                    "df-day",
                    !d ? "df-day-empty" : "",
                    isDisabled(d) ? "df-day-disabled" : "",
                    isSelected(d) ? "df-day-selected" : "",
                    isToday(d) && !isSelected(d) ? "df-day-today" : ""
                  ].join(" ").trim()}
                  onClick={() => pick(d)}
                  disabled={!d || isDisabled(d)}
                  tabIndex={d ? 0 : -1}
                >
                  {d || ""}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
