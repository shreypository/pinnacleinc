import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHotel, FaArrowLeft, FaTimes, FaDoorOpen, FaUserFriends, FaChild,
  FaWallet, FaUmbrellaBeach, FaBuilding, FaHome, FaBed,
  FaConciergeBell, FaMapMarkedAlt, FaStar
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LocationSelect from "../components/hotels/LocationSelect";
import DateField from "../components/common/DateField";
import { createHotelInquiry } from "../services/api";
import "./Hotels.css";

const PROPERTY_TYPES = [
  { key: "Hotel",     icon: FaHotel },
  { key: "Resort",    icon: FaUmbrellaBeach },
  { key: "Apartment", icon: FaBuilding },
  { key: "Villa",     icon: FaHome },
  { key: "Hostel",    icon: FaBed }
];

const PRICE_RANGES = [
  "Any",
  "Under ₹2,500",
  "₹2,500 – ₹5,000",
  "₹5,000 – ₹10,000",
  "₹10,000 – ₹20,000",
  "₹20,000+"
];

const FEATURES = [
  { icon: FaConciergeBell, title: "Concierge Support",  desc: "Personalised assistance from enquiry to check-out" },
  { icon: FaMapMarkedAlt,  title: "Near Your Campus",   desc: "Stays close to your university and key amenities" },
  { icon: FaStar,          title: "Hand-picked Stays",  desc: "Curated, verified properties across the globe" }
];

const todayStr = () => new Date().toISOString().split("T")[0];
const nextDay = (str) => {
  if (!str) return todayStr();
  const d = new Date(str + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};
const prettyDate = (str) => {
  if (!str) return "";
  const d = new Date(str + "T00:00:00");
  return isNaN(d) ? "" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
};

export default function Hotels() {
  const navigate = useNavigate();

  /* ── Search state ── */
  const [location, setLocation]   = useState(null);
  const [checkIn, setCheckIn]     = useState("");
  const [checkOut, setCheckOut]   = useState("");
  const [rooms, setRooms]         = useState(1);
  const [adults, setAdults]       = useState(2);
  const [children, setChildren]   = useState(0);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState("Any");
  const [priceOpen, setPriceOpen] = useState(false);
  const [propertyType, setPropertyType] = useState("Hotel");
  const [widgetError, setWidgetError] = useState("");

  /* ── Lead modal ── */
  const [modalOpen, setModalOpen]   = useState(false);
  const [lead, setLead]             = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [modalError, setModalError] = useState("");

  const heroRef   = useRef(null);
  const guestsRef = useRef(null);
  const priceRef  = useRef(null);
  const pageRef   = useRef(null);

  /* Parallax */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  /* Close popovers on outside click */
  useEffect(() => {
    const onDown = (e) => {
      if (guestsRef.current && !guestsRef.current.contains(e.target)) setGuestsOpen(false);
      if (priceRef.current && !priceRef.current.contains(e.target)) setPriceOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* Keep checkout after checkin */
  useEffect(() => {
    if (checkIn && checkOut && checkOut <= checkIn) setCheckOut(nextDay(checkIn));
  }, [checkIn, checkOut]);

  /* Scroll reveal */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); }
      }),
      { threshold: 0.15 }
    );
    pageRef.current?.querySelectorAll(".scroll-reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const skyline = useMemo(
    () => [...Array(11)].map((_, i) => ({
      h: 40 + ((i * 37) % 120),
      w: 36 + ((i * 19) % 30),
      windows: 3 + (i % 4)
    })),
    []
  );

  const floatingCards = useMemo(
    () => [
      { left: "8%",  top: "22%", dur: 7,  delay: 0,   label: "★ 4.9 · Goa Resort" },
      { left: "74%", top: "18%", dur: 8,  delay: 1.2, label: "★ 4.8 · London Suite" },
      { left: "82%", top: "55%", dur: 9,  delay: 0.6, label: "★ 4.7 · Dubai Stay" }
    ],
    []
  );

  const guestSummary = `${rooms} Room${rooms > 1 ? "s" : ""} · ${adults + children} Guest${adults + children > 1 ? "s" : ""}`;

  const handleFind = () => {
    setWidgetError("");
    if (!location)  return setWidgetError("Please select a location.");
    if (!checkIn)   return setWidgetError("Please choose a check-in date.");
    if (!checkOut)  return setWidgetError("Please choose a check-out date.");
    if (checkOut <= checkIn) return setWidgetError("Check-out must be after check-in.");
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    if (submitted) { setSubmitted(false); setLead({ name: "", email: "", phone: "" }); }
  };

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
      await createHotelInquiry({
        location: location.city,
        locationLabel: location.label,
        checkIn, checkOut,
        rooms, adults, children,
        priceRange, propertyType,
        name, email, phone
      });
      setSubmitted(true);
    } catch (err) {
      setModalError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ht-page" ref={pageRef}>

      {/* ════════════════ HERO ════════════════ */}
      <section className="ht-hero" ref={heroRef}>
        <div className="ht-hero-bg" aria-hidden="true" />
        <div className="ht-lighting ht-lighting-1" aria-hidden="true" />
        <div className="ht-lighting ht-lighting-2" aria-hidden="true" />

        {/* Skyline */}
        <div className="ht-skyline" aria-hidden="true">
          {skyline.map((b, i) => (
            <div key={i} className="ht-building" style={{ height: `${b.h}px`, width: `${b.w}px` }}>
              {[...Array(b.windows)].map((_, w) => (
                <span key={w} className="ht-window" style={{ animationDelay: `${(i + w) * 0.4}s` }} />
              ))}
            </div>
          ))}
        </div>

        {/* Floating glass hotel cards */}
        <div className="ht-floats" aria-hidden="true">
          {floatingCards.map((c, i) => (
            <motion.div
              key={i}
              className="ht-float-card"
              style={{ left: c.left, top: c.top }}
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaHotel /> <span>{c.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Particles */}
        <div className="ht-particles" aria-hidden="true">
          {[...Array(16)].map((_, i) => <span key={i} />)}
        </div>

        {/* Copy */}
        <motion.div
          className="ht-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <button className="ht-back" onClick={() => navigate("/flights-hotels")}>
            <FaArrowLeft /> Back
          </button>
          <span className="ht-eyebrow">Pinnacle Stays</span>
          <h1 className="ht-hero-title">Find Your Perfect Stay, Anywhere</h1>
          <p className="ht-hero-sub">
            From campus-side apartments to weekend resorts — tell us what you need and our
            concierge team curates the right stay for you.
          </p>
        </motion.div>
      </section>

      {/* ════════════════ SEARCH WIDGET ════════════════ */}
      <motion.section
        className="ht-widget-wrap"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        <div className="ht-widget">

          {/* Cells */}
          <div className="ht-cells">
            <div className="ht-cell ht-cell-loc">
              <LocationSelect label="Location" value={location} onChange={setLocation} />
            </div>

            <div className="ht-cell ht-cell-date">
              <DateField label="Check-In" value={checkIn} min={todayStr()} onChange={setCheckIn} />
            </div>

            <div className="ht-cell ht-cell-date">
              <DateField label="Check-Out" value={checkOut} min={nextDay(checkIn) } onChange={setCheckOut} align="right" />
            </div>

            {/* Rooms & guests */}
            <div className="ht-cell ht-cell-guests" ref={guestsRef}>
              <button type="button" className="ht-guests-trigger" onClick={() => { setGuestsOpen((o) => !o); setPriceOpen(false); }}>
                <span className="ht-cell-label">Rooms &amp; Guests</span>
                <span className="ht-guests-value">{guestSummary}</span>
                <span className="ht-guests-sub">{adults} Adults · {children} Children</span>
              </button>

              <AnimatePresence>
                {guestsOpen && (
                  <motion.div
                    className="ht-pop"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                  >
                    {[
                      { label: "Rooms",    icon: FaDoorOpen,     val: rooms,    set: setRooms,    min: 1, max: 10 },
                      { label: "Adults",   icon: FaUserFriends,  val: adults,   set: setAdults,   min: 1, max: 30 },
                      { label: "Children", icon: FaChild,        val: children, set: setChildren, min: 0, max: 20 }
                    ].map((row) => {
                      const Icon = row.icon;
                      return (
                        <div className="ht-pop-row" key={row.label}>
                          <span className="ht-pop-label"><Icon /> {row.label}</span>
                          <div className="ht-stepper">
                            <button type="button" onClick={() => row.set((n) => Math.max(row.min, n - 1))}
                              disabled={row.val <= row.min} aria-label={`Decrease ${row.label}`}>−</button>
                            <span>{row.val}</span>
                            <button type="button" onClick={() => row.set((n) => Math.min(row.max, n + 1))}
                              disabled={row.val >= row.max} aria-label={`Increase ${row.label}`}>+</button>
                          </div>
                        </div>
                      );
                    })}
                    <button type="button" className="ht-pop-done" onClick={() => setGuestsOpen(false)}>Done</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price range */}
            <div className="ht-cell ht-cell-price" ref={priceRef}>
              <button type="button" className="ht-guests-trigger" onClick={() => { setPriceOpen((o) => !o); setGuestsOpen(false); }}>
                <span className="ht-cell-label">Price Range</span>
                <span className="ht-guests-value ht-price-value"><FaWallet /> {priceRange}</span>
                <span className="ht-guests-sub">per night</span>
              </button>

              <AnimatePresence>
                {priceOpen && (
                  <motion.div
                    className="ht-pop ht-pop-right"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="ht-price-list">
                      {PRICE_RANGES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`ht-price-opt ${priceRange === p ? "active" : ""}`}
                          onClick={() => { setPriceRange(p); setPriceOpen(false); }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Property type chips */}
          <div className="ht-proptypes">
            <span className="ht-proptypes-label">Property Type</span>
            <div className="ht-proptype-row">
              {PROPERTY_TYPES.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={`ht-proptype-chip ${propertyType === key ? "active" : ""}`}
                  onClick={() => setPropertyType(key)}
                >
                  <Icon /> {key}
                </button>
              ))}
            </div>
          </div>

          {/* Error + submit */}
          <AnimatePresence>
            {widgetError && (
              <motion.div
                className="ht-widget-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {widgetError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ht-submit-row">
            <motion.button
              type="button"
              className="ht-find-btn"
              onClick={handleFind}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaHotel className="ht-find-icon" /> Find Hotel Assistance
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="ht-features-section">
        <h2 className="ht-features-title scroll-reveal">Why book your stay with Pinnacle</h2>
        <div className="ht-features">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={`ht-feature scroll-reveal reveal-delay-${i + 1}`}>
                <div className="ht-feature-icon"><Icon /></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════ LEAD MODAL ════════════════ */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="ht-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="ht-modal"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="ht-modal-close" onClick={closeModal} aria-label="Close"><FaTimes /></button>

              {submitted ? (
                <div className="ht-success">
                  <motion.div
                    className="ht-success-ring"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  >
                    <svg viewBox="0 0 52 52" className="ht-success-svg">
                      <motion.circle cx="26" cy="26" r="24" fill="none" className="ht-success-circle"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
                      <motion.path fill="none" d="M14 27 l8 8 l16 -16" className="ht-success-check"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.35 }} />
                    </svg>
                  </motion.div>
                  <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    Request Submitted!
                  </motion.h3>
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    Your hotel assistance request has been submitted successfully.
                    Our team will contact you shortly.
                  </motion.p>
                  <button className="ht-success-btn" onClick={closeModal}>Done</button>
                </div>
              ) : (
                <>
                  <div className="ht-modal-head">
                    <h3>Almost there!</h3>
                    <p>Share your details and our concierge team will curate the best stays for you.</p>
                  </div>

                  <div className="ht-modal-summary">
                    <div className="ht-summary-loc"><FaHotel /> {location?.label}</div>
                    <div className="ht-summary-meta">
                      {prettyDate(checkIn)} → {prettyDate(checkOut)} · {rooms} room{rooms > 1 ? "s" : ""} ·
                      {" "}{adults + children} guest{adults + children > 1 ? "s" : ""} · {propertyType} · {priceRange}
                    </div>
                  </div>

                  <form className="ht-form" onSubmit={submitLead} noValidate>
                    {modalError && <div className="ht-form-error">{modalError}</div>}

                    <div className="ht-field">
                      <label htmlFor="ht-name">Full Name</label>
                      <input id="ht-name" type="text" value={lead.name} autoComplete="name" disabled={submitting}
                        placeholder="e.g. Arjun Sharma" onChange={(e) => setLead({ ...lead, name: e.target.value })} />
                    </div>
                    <div className="ht-field">
                      <label htmlFor="ht-email">Email</label>
                      <input id="ht-email" type="email" value={lead.email} autoComplete="email" disabled={submitting}
                        placeholder="you@example.com" onChange={(e) => setLead({ ...lead, email: e.target.value })} />
                    </div>
                    <div className="ht-field">
                      <label htmlFor="ht-phone">Phone Number</label>
                      <input id="ht-phone" type="tel" inputMode="numeric" value={lead.phone} autoComplete="tel" disabled={submitting}
                        placeholder="10-digit mobile number" onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
                    </div>

                    <button type="submit" className="ht-form-submit" disabled={submitting}>
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
