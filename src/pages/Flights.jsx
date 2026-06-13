import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlane, FaExchangeAlt, FaUserFriends, FaChair,
  FaTimes, FaArrowLeft, FaPlus, FaTrashAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AirportSelect from "../components/flights/AirportSelect";
import DateField from "../components/common/DateField";
import { createFlightInquiry } from "../services/api";
import "./Flights.css";

const TRIP_TYPES = ["One Way", "Round Trip", "Multi City"];
const CABINS = ["Economy", "Premium Economy", "Business", "First Class"];
const MAX_SEGMENTS = 5;

const todayStr = () => new Date().toISOString().split("T")[0];

const prettyDate = (str) => {
  if (!str) return "";
  const d = new Date(str + "T00:00:00");
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
};

let segId = 0;
const newSegment = () => ({ id: ++segId, from: null, to: null, date: "" });

export default function Flights() {
  const navigate = useNavigate();

  /* ── Search widget state ── */
  const [tripType, setTripType]       = useState("One Way");
  const [from, setFrom]               = useState(null);
  const [to, setTo]                   = useState(null);
  const [departureDate, setDeparture] = useState("");
  const [returnDate, setReturn]       = useState("");
  const [segments, setSegments]       = useState([]);   // Multi City legs
  const [travellers, setTravellers]   = useState(1);
  const [cabinClass, setCabin]        = useState("Economy");
  const [paxOpen, setPaxOpen]         = useState(false);
  const [widgetError, setWidgetError] = useState("");

  /* ── Lead modal state ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [lead, setLead]           = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [modalError, setModalError] = useState("");

  /* ── Parallax via CSS vars ── */
  const heroRef = useRef(null);
  const paxRef  = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  // Close travellers popover on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (paxRef.current && !paxRef.current.contains(e.target)) setPaxOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Keep return date valid relative to departure / trip type
  useEffect(() => {
    if (tripType !== "Round Trip" && returnDate) setReturn("");
    else if (departureDate && returnDate && returnDate < departureDate) setReturn(departureDate);
  }, [tripType, departureDate, returnDate]);

  // Initialise two legs the first time Multi City is chosen
  useEffect(() => {
    if (tripType === "Multi City" && segments.length < 2) {
      setSegments([newSegment(), newSegment()]);
    }
  }, [tripType, segments.length]);

  const clouds = useMemo(
    () => [
      { top: 18, scale: 1.0, dur: 38, delay: 0 },
      { top: 38, scale: 0.7, dur: 52, delay: 6 },
      { top: 60, scale: 1.2, dur: 44, delay: 3 },
      { top: 72, scale: 0.6, dur: 60, delay: 10 }
    ],
    []
  );

  const swap = useCallback(() => { setFrom(to); setTo(from); }, [from, to]);

  /* ── Multi City helpers ── */
  const updateSegment = (id, patch) =>
    setSegments((segs) => segs.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const addSegment = () =>
    setSegments((segs) => (segs.length >= MAX_SEGMENTS ? segs : [...segs, newSegment()]));
  const removeSegment = (id) =>
    setSegments((segs) => (segs.length <= 2 ? segs : segs.filter((s) => s.id !== id)));

  /* ── Validate selection, then open the lead modal ── */
  const handleFindAssistance = () => {
    setWidgetError("");

    if (tripType === "Multi City") {
      for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        if (!s.from || !s.to) return setWidgetError(`Please complete flight ${i + 1}'s airports.`);
        if (s.from.code === s.to.code) return setWidgetError(`Flight ${i + 1}: origin and destination cannot match.`);
        if (!s.date) return setWidgetError(`Please choose a date for flight ${i + 1}.`);
        if (i > 0 && s.date < segments[i - 1].date)
          return setWidgetError(`Flight ${i + 1}'s date cannot be before flight ${i}.`);
      }
    } else {
      if (!from)  return setWidgetError("Please select a departure airport.");
      if (!to)    return setWidgetError("Please select a destination airport.");
      if (from.code === to.code) return setWidgetError("Departure and destination cannot be the same.");
      if (!departureDate) return setWidgetError("Please choose a departure date.");
      if (tripType === "Round Trip" && !returnDate)
        return setWidgetError("Please choose a return date for your round trip.");
    }

    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    if (submitted) {
      setSubmitted(false);
      setLead({ name: "", email: "", phone: "" });
    }
  };

  // Endpoints used for payload + modal summary
  const displayFrom = tripType === "Multi City" ? segments[0]?.from : from;
  const displayTo   = tripType === "Multi City" ? segments[segments.length - 1]?.to : to;
  const displayDate = tripType === "Multi City" ? segments[0]?.date : departureDate;

  const submitLead = async (e) => {
    e.preventDefault();
    setModalError("");

    const name = lead.name.trim();
    const email = lead.email.trim();
    const phone = lead.phone.replace(/\D/g, "");

    if (name.length < 2) return setModalError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setModalError("Please enter a valid email address.");
    if (!/^\d{10,15}$/.test(phone)) return setModalError("Please enter a valid phone number (10–15 digits).");

    setSubmitting(true);
    try {
      await createFlightInquiry({
        tripType,
        fromCity: displayFrom.city,
        fromAirportCode: displayFrom.code,
        toCity: displayTo.city,
        toAirportCode: displayTo.code,
        departureDate: displayDate,
        returnDate: tripType === "Round Trip" ? returnDate : null,
        travellers,
        cabinClass,
        segments: tripType === "Multi City"
          ? segments.map((s) => ({
              fromCity: s.from.city, fromAirportCode: s.from.code,
              toCity: s.to.city, toAirportCode: s.to.code, date: s.date
            }))
          : [],
        name, email, phone
      });
      setSubmitted(true);
    } catch (err) {
      setModalError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Travellers & class cell (shared across layouts; only one is mounted) ── */
  const paxCell = (
    <div className="fl-cell fl-cell-pax" ref={paxRef}>
      <button type="button" className="fl-pax-trigger" onClick={() => setPaxOpen((o) => !o)}>
        <span className="fl-cell-label">Travellers &amp; Class</span>
        <span className="fl-pax-value">
          <strong>{travellers}</strong> {travellers > 1 ? "Travellers" : "Traveller"}
        </span>
        <span className="fl-pax-class">{cabinClass}</span>
      </button>

      <AnimatePresence>
        {paxOpen && (
          <motion.div
            className="fl-pax-pop"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div className="fl-pax-section">
              <span className="fl-pax-pop-label"><FaUserFriends /> Travellers</span>
              <div className="fl-stepper">
                <button type="button" onClick={() => setTravellers((n) => Math.max(1, n - 1))}
                  disabled={travellers <= 1} aria-label="Decrease travellers">−</button>
                <span>{travellers}</span>
                <button type="button" onClick={() => setTravellers((n) => Math.min(9, n + 1))}
                  disabled={travellers >= 9} aria-label="Increase travellers">+</button>
              </div>
            </div>

            <div className="fl-pax-section fl-pax-section-col">
              <span className="fl-pax-pop-label"><FaChair /> Cabin Class</span>
              <div className="fl-class-grid">
                {CABINS.map((c) => (
                  <button key={c} type="button"
                    className={`fl-class-chip ${cabinClass === c ? "active" : ""}`}
                    onClick={() => setCabin(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="fl-pax-done" onClick={() => setPaxOpen(false)}>Done</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="fl-page">

      {/* ════════════════ HERO ════════════════ */}
      <section className="fl-hero" ref={heroRef}>
        <div className="fl-hero-bg" aria-hidden="true" />

        {/* Drifting clouds */}
        <div className="fl-clouds" aria-hidden="true">
          {clouds.map((c, i) => (
            <span key={i} className="fl-cloud"
              style={{ top: `${c.top}%`, transform: `scale(${c.scale})`,
                animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }} />
          ))}
        </div>

        {/* Flight path + plane */}
        <div className="fl-flightpath" aria-hidden="true">
          <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="fl-path-svg">
            <path id="flpath" d="M-50,250 C300,40 900,40 1250,210" className="fl-path-line" />
          </svg>
          <motion.div
            className="fl-plane"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          >
            <span className="fl-plane-trail" />
            <FaPlane className="fl-plane-icon" />
          </motion.div>
        </div>

        {/* Floating particles */}
        <div className="fl-hero-particles" aria-hidden="true">
          {[...Array(18)].map((_, i) => <span key={i} />)}
        </div>

        {/* Parallax copy */}
        <motion.div
          className="fl-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <button className="fl-back" onClick={() => navigate("/flights-hotels")}>
            <FaArrowLeft /> Back
          </button>
          <span className="fl-eyebrow">Pinnacle Travel</span>
          <h1 className="fl-hero-title">Book International &amp; Domestic Flights</h1>
          <p className="fl-hero-sub">
            Tell us where you want to go — our travel team handles the rest with
            personalised fare assistance and end-to-end support.
          </p>
        </motion.div>
      </section>

      {/* ════════════════ SEARCH WIDGET ════════════════ */}
      <motion.section
        className="fl-widget-wrap"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        <div className="fl-widget">

          {/* Trip type + tagline */}
          <div className="fl-widget-top">
            <div className="fl-trip-types" role="radiogroup" aria-label="Trip type">
              {TRIP_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={tripType === t}
                  className={`fl-trip-pill ${tripType === t ? "active" : ""}`}
                  onClick={() => setTripType(t)}
                >
                  <span className="fl-radio-dot" />
                  {t}
                </button>
              ))}
            </div>
            <span className="fl-widget-tag">Book International and Domestic Flights</span>
          </div>

          {/* ── One Way / Round Trip layout ── */}
          {tripType !== "Multi City" && (
            <div className="fl-cells">
              <div className="fl-cell fl-cell-airport">
                <AirportSelect label="From" value={from} onChange={setFrom} />
              </div>

              <button type="button" className="fl-swap" onClick={swap} aria-label="Swap airports">
                <FaExchangeAlt />
              </button>

              <div className="fl-cell fl-cell-airport">
                <AirportSelect label="To" value={to} onChange={setTo} />
              </div>

              <div className="fl-cell fl-cell-date">
                <DateField label="Departure" value={departureDate} min={todayStr()} onChange={setDeparture} />
              </div>

              <div className={`fl-cell fl-cell-date ${tripType !== "Round Trip" ? "fl-cell-muted" : ""}`}>
                {tripType === "Round Trip" ? (
                  <DateField label="Return" value={returnDate}
                    min={departureDate || todayStr()} onChange={setReturn} align="right" />
                ) : (
                  <div className="fl-return-hint-cell">
                    <span className="fl-cell-label">Return</span>
                    <span className="fl-date-hint">Switch to “Round Trip” to add a return date</span>
                  </div>
                )}
              </div>

              {paxCell}
            </div>
          )}

          {/* ── Multi City layout ── */}
          {tripType === "Multi City" && (
            <div className="fl-multi">
              {segments.map((seg, idx) => (
                <motion.div
                  key={seg.id}
                  className="fl-cells fl-multi-row"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <span className="fl-seg-index">{idx + 1}</span>
                  <div className="fl-cell fl-cell-airport">
                    <AirportSelect label="From" value={seg.from}
                      onChange={(v) => updateSegment(seg.id, { from: v })} />
                  </div>
                  <div className="fl-cell fl-cell-airport">
                    <AirportSelect label="To" value={seg.to}
                      onChange={(v) => updateSegment(seg.id, { to: v })} />
                  </div>
                  <div className="fl-cell fl-cell-date">
                    <DateField label="Date" value={seg.date}
                      min={idx > 0 ? (segments[idx - 1].date || todayStr()) : todayStr()}
                      onChange={(v) => updateSegment(seg.id, { date: v })} align="right" />
                  </div>
                  {segments.length > 2 && (
                    <button type="button" className="fl-seg-remove"
                      onClick={() => removeSegment(seg.id)} aria-label={`Remove flight ${idx + 1}`}>
                      <FaTrashAlt />
                    </button>
                  )}
                </motion.div>
              ))}

              <div className="fl-multi-actions">
                {segments.length < MAX_SEGMENTS && (
                  <button type="button" className="fl-add-seg" onClick={addSegment}>
                    <FaPlus /> Add another flight
                  </button>
                )}
              </div>

              <div className="fl-cells fl-multi-pax">{paxCell}</div>
            </div>
          )}

          {/* Error + submit */}
          <AnimatePresence>
            {widgetError && (
              <motion.div
                className="fl-widget-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {widgetError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="fl-submit-row">
            <motion.button
              type="button"
              className="fl-find-btn"
              onClick={handleFindAssistance}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaPlane className="fl-find-icon" /> Find Flight Assistance
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ════════════════ LEAD MODAL ════════════════ */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fl-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="fl-modal"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="fl-modal-close" onClick={closeModal} aria-label="Close">
                <FaTimes />
              </button>

              {submitted ? (
                /* ── Success animation ── */
                <div className="fl-success">
                  <motion.div
                    className="fl-success-ring"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  >
                    <svg viewBox="0 0 52 52" className="fl-success-svg">
                      <motion.circle
                        cx="26" cy="26" r="24" fill="none"
                        className="fl-success-circle"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                      <motion.path
                        fill="none" d="M14 27 l8 8 l16 -16"
                        className="fl-success-check"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.35 }}
                      />
                    </svg>
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Request Submitted!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Your flight assistance request has been submitted successfully.
                    Our team will contact you shortly.
                  </motion.p>
                  <button className="fl-success-btn" onClick={closeModal}>Done</button>
                </div>
              ) : (
                /* ── Lead form ── */
                <>
                  <div className="fl-modal-head">
                    <h3>Almost there!</h3>
                    <p>Share your details and our travel team will reach out with the best options.</p>
                  </div>

                  {/* Trip summary */}
                  <div className="fl-modal-summary">
                    <div className="fl-summary-route">
                      <span>{displayFrom?.code}</span>
                      <FaPlane className="fl-summary-plane" />
                      <span>{displayTo?.code}</span>
                    </div>
                    <div className="fl-summary-meta">
                      {tripType} · {prettyDate(displayDate)}
                      {tripType === "Round Trip" && returnDate ? ` – ${prettyDate(returnDate)}` : ""}
                      {tripType === "Multi City" ? ` · ${segments.length} flights` : ""}
                      {" · "}{travellers} pax · {cabinClass}
                    </div>
                  </div>

                  <form className="fl-form" onSubmit={submitLead} noValidate>
                    {modalError && <div className="fl-form-error">{modalError}</div>}

                    <div className="fl-field">
                      <label htmlFor="fl-name">Full Name</label>
                      <input
                        id="fl-name"
                        type="text"
                        value={lead.name}
                        onChange={(e) => setLead({ ...lead, name: e.target.value })}
                        placeholder="e.g. Arjun Sharma"
                        autoComplete="name"
                        disabled={submitting}
                      />
                    </div>

                    <div className="fl-field">
                      <label htmlFor="fl-email">Email</label>
                      <input
                        id="fl-email"
                        type="email"
                        value={lead.email}
                        onChange={(e) => setLead({ ...lead, email: e.target.value })}
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={submitting}
                      />
                    </div>

                    <div className="fl-field">
                      <label htmlFor="fl-phone">Phone Number</label>
                      <input
                        id="fl-phone"
                        type="tel"
                        inputMode="numeric"
                        value={lead.phone}
                        onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        autoComplete="tel"
                        disabled={submitting}
                      />
                    </div>

                    <button type="submit" className="fl-form-submit" disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit Request"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
