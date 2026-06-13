import { useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPlaneDeparture, FaHotel, FaArrowRight } from "react-icons/fa";
import "./FlightsHotels.css";

const CARDS = [
  {
    key: "flights",
    title: "Flights",
    desc: "Book international & domestic flights with expert assistance",
    icon: FaPlaneDeparture,
    path: "/services/flights",
    gradient: ["#6a0dad", "#9b4dca"]
  },
  {
    key: "hotels",
    title: "Hotels",
    desc: "Find comfortable, budget-friendly stays worldwide",
    icon: FaHotel,
    path: "/services/hotels",
    gradient: ["#7c3aed", "#a855f7"]
  }
];

export default function FlightsHotels() {
  const navigate = useNavigate();
  const glowRef = useRef(null);

  // Stable particle field (no re-randomising on re-render)
  const particles = useMemo(
    () => [...Array(22)].map(() => ({
      left: Math.random() * 100,
      duration: 12 + Math.random() * 12,
      delay: Math.random() * 8,
      size: 4 + Math.random() * 5
    })),
    []
  );

  // Page-wide mouse glow
  useEffect(() => {
    const move = (e) => {
      if (glowRef.current) {
        glowRef.current.style.left = e.clientX - 140 + "px";
        glowRef.current.style.top = e.clientY - 140 + "px";
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.18, delayChildren: 0.15 } }
  };

  const card = {
    hidden: (dir) => ({ x: dir === "left" ? -160 : 160, opacity: 0, scale: 0.92 }),
    show: { x: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 110, damping: 15 } }
  };

  return (
    <div className="fh-container">

      {/* Ambient floating particles */}
      <div className="fh-particles" aria-hidden="true">
        {particles.map((p, i) => (
          <span
            key={i}
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      {/* Mouse glow */}
      <div className="fh-mouse-glow" ref={glowRef} aria-hidden="true" />

      {/* Title */}
      <motion.h1
        className="fh-title"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Flights &amp; Hotels
      </motion.h1>
      <motion.p
        className="fh-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6 }}
      >
        Choose a service to get started
      </motion.p>

      {/* Selection cards */}
      <motion.div className="fh-cards" variants={container} initial="hidden" animate="show">
        {CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.key}
              className="fh-card"
              custom={i === 0 ? "left" : "right"}
              variants={card}
              whileHover={{ scale: 1.05, y: -6 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(c.path)}
              style={{ "--g1": c.gradient[0], "--g2": c.gradient[1] }}
            >
              <div className="fh-card-glow" aria-hidden="true" />

              <div className="fh-icon-badge">
                <Icon />
              </div>

              <h2 className="fh-card-title">{c.title}</h2>
              <p className="fh-card-desc">{c.desc}</p>

              <span className="fh-card-cta">
                Explore <FaArrowRight className="fh-cta-arrow" />
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
