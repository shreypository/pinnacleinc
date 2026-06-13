import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { searchAirports } from "../../data/airports";
import "./AirportSelect.css";

/*
  AirportSelect — premium type-ahead airport picker.
  Renders like a card field (label + big city + airport sub-line) and opens
  a filterable dropdown. Type "Ban" → Bangalore (BLR), "Del" → Delhi (DEL).

  Props:
    label       — field label (e.g. "From")
    value       — selected airport object | null
    onChange    — (airport) => void
    placeholder — input placeholder when no selection
*/
export default function AirportSelect({ label, value, onChange, placeholder = "Search city or airport" }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState(() => searchAirports(""));
  const [active, setActive]   = useState(0);

  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  // Recompute results as the user types
  useEffect(() => {
    setResults(searchAirports(query));
    setActive(0);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Focus the input when the dropdown opens
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const choose = useCallback((airport) => {
    onChange(airport);
    setOpen(false);
    setQuery("");
  }, [onChange]);

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) choose(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="airport-select" ref={wrapRef}>
      <button
        type="button"
        className={`as-field ${open ? "as-field-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="as-label">{label}</span>

        {value ? (
          <>
            <span className="as-city">{value.city}</span>
            <span className="as-sub">{value.code}, {value.name}</span>
          </>
        ) : (
          <>
            <span className="as-city as-placeholder">Select</span>
            <span className="as-sub">Tap to search airports</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="as-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="as-search-row">
              <span className="as-search-icon" aria-hidden="true">⌕</span>
              <input
                ref={inputRef}
                className="as-search-input"
                type="text"
                value={query}
                placeholder={placeholder}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
              />
            </div>

            <ul className="as-list" role="listbox">
              {results.length === 0 ? (
                <li className="as-empty">No airports found</li>
              ) : (
                results.map((a, i) => (
                  <li
                    key={a.code}
                    role="option"
                    aria-selected={i === active}
                    className={`as-option ${i === active ? "as-option-active" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(a)}
                  >
                    <span className="as-option-code">{a.code}</span>
                    <span className="as-option-text">
                      <span className="as-option-city">{a.city}</span>
                      <span className="as-option-name">{a.name} · {a.country}</span>
                    </span>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
