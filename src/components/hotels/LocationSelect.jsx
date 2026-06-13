import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import { searchLocations } from "../../data/locations";
import "./LocationSelect.css";

/*
  LocationSelect — premium type-ahead location picker for Hotels.
  Supports city / area / country search (fuzzy) AND free-text entry
  (e.g. a specific hotel name or neighbourhood not in the dataset).

  value:    { city, label } | null
  onChange: (loc) => void   where loc = { city, region?, country?, label }
*/
export default function LocationSelect({ label = "Location", value, onChange, placeholder = "City, area or hotel name" }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState(() => searchLocations(""));
  const [active, setActive]   = useState(0);

  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setResults(searchLocations(query));
    setActive(0);
  }, [query]);

  useEffect(() => {
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const chooseLocation = useCallback((loc) => {
    onChange({
      city: loc.city,
      region: loc.region,
      country: loc.country,
      label: `${loc.city}, ${loc.region ? loc.region + ", " : ""}${loc.country}`
    });
    setOpen(false);
    setQuery("");
  }, [onChange]);

  const chooseFreeText = useCallback(() => {
    const text = query.trim();
    if (!text) return;
    onChange({ city: text, label: text, freeText: true });
    setOpen(false);
    setQuery("");
  }, [query, onChange]);

  const showFreeText = query.trim().length > 0 &&
    !results.some((r) => r.city.toLowerCase() === query.trim().toLowerCase());

  const onKeyDown = (e) => {
    if (!open) return;
    const total = results.length + (showFreeText ? 1 : 0);
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, total - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (showFreeText && active === results.length) chooseFreeText();
      else if (results[active]) chooseLocation(results[active]);
      else if (showFreeText) chooseFreeText();
    } else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="ls" ref={wrapRef}>
      <button type="button" className={`ls-field ${open ? "ls-field-open" : ""}`} onClick={() => setOpen((o) => !o)}>
        <span className="ls-label">{label}</span>
        {value ? (
          <>
            <span className="ls-city">{value.city}</span>
            <span className="ls-sub">{value.label}</span>
          </>
        ) : (
          <>
            <span className="ls-city ls-placeholder">Select</span>
            <span className="ls-sub">Tap to search destinations</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ls-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="ls-search-row">
              <FaMapMarkerAlt className="ls-search-icon" />
              <input
                ref={inputRef}
                className="ls-search-input"
                type="text"
                value={query}
                placeholder={placeholder}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
              />
            </div>

            <ul className="ls-list" role="listbox">
              {results.map((l, i) => (
                <li
                  key={`${l.city}-${l.country}`}
                  role="option"
                  aria-selected={i === active}
                  className={`ls-option ${i === active ? "ls-option-active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => chooseLocation(l)}
                >
                  <FaMapMarkerAlt className="ls-option-pin" />
                  <span className="ls-option-text">
                    <span className="ls-option-city">{l.city}</span>
                    <span className="ls-option-name">{l.region ? `${l.region} · ` : ""}{l.country}</span>
                  </span>
                </li>
              ))}

              {showFreeText && (
                <li
                  role="option"
                  aria-selected={active === results.length}
                  className={`ls-option ls-option-free ${active === results.length ? "ls-option-active" : ""}`}
                  onMouseEnter={() => setActive(results.length)}
                  onClick={chooseFreeText}
                >
                  <FaMapMarkerAlt className="ls-option-pin" />
                  <span className="ls-option-text">
                    <span className="ls-option-city">Use “{query.trim()}”</span>
                    <span className="ls-option-name">Search this location / property</span>
                  </span>
                </li>
              )}

              {results.length === 0 && !showFreeText && (
                <li className="ls-empty">Start typing a city or destination</li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
