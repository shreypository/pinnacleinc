import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaGraduationCap, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./StandardizedTests.css";

const StandardizedTests = () => {
  const [view, setView] = useState("root");
  const navigate = useNavigate();

  /* ✅ FIXED background (no shaking) */
  const particles = useMemo(() =>
    [...Array(25)].map(() => ({
      left: Math.random() * 100,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 5
    })),
  []);

  /* 🎬 Premium animation variants */
  const containerVariant = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariant = {
    hidden: (dir) => ({
      x: dir === "left" ? -200 : 200,
      opacity: 0,
      scale: 0.9
    }),
    show: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 14
      }
    }
  };

  return (
    <div className="tests-container">

      {/* 🌌 BACKGROUND */}
      <div className="bg-animation">
        {particles.map((p, i) => (
          <span
            key={i}
            style={{
              left: p.left + "%",
              animationDuration: p.duration + "s",
              animationDelay: p.delay + "s"
            }}
          />
        ))}
      </div>

      {/* 🏷 TITLE */}
      <motion.h1
        className="title"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Standardized Tests
      </motion.h1>

      <AnimatePresence mode="wait">

        {/* ================= ROOT VIEW ================= */}
        {view === "root" && (
          <motion.div
            key="root"
            className="cards-root"
            variants={containerVariant}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -40 }}
          >

            {/* UNDERGRAD */}
            <motion.div
              className="card root-card"
              custom="left"
              variants={cardVariant}
              onClick={() => setView("undergrad")}
              whileHover={{ scale: 1.05 }}
            >
              <FaGraduationCap className="icon" />
              Undergraduate
            </motion.div>

            {/* GRAD */}
            <motion.div
              className="card root-card"
              custom="right"
              variants={cardVariant}
              onClick={() => setView("grad")}
              whileHover={{ scale: 1.05 }}
            >
              <FaChartLine className="icon" />
              Graduate
            </motion.div>

          </motion.div>
        )}
                {/* ================= UNDERGRAD VIEW ================= */}
        {view === "undergrad" && (
          <motion.div
            key="undergrad"
            className="tree-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            {/* BACK BUTTON */}
            <motion.div
              className="back"
              onClick={() => setView("root")}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <FaArrowLeft />
            </motion.div>

            {/* SVG CONNECTORS */}
            <svg className="connectors" viewBox="0 0 1200 500">
              <defs>
                <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#6a0dad" />
                </linearGradient>
              </defs>

              {/* LEFT CURVE */}
              <path
                d="M600 250 C 450 250, 400 250, 250 250"
                className="connector-path"
              />

              {/* RIGHT CURVE */}
              <path
                d="M600 250 C 750 250, 800 250, 950 250"
                className="connector-path"
              />
            </svg>

            {/* CENTER */}
            <motion.div
              className="card center active"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <FaGraduationCap className="icon" />
              Undergraduate
            </motion.div>

            {/* LEFT */}
            <motion.div
              className="card branch left"
              onClick={() => navigate("/sat")}
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              SAT / AP
            </motion.div>

            {/* RIGHT */}
            <motion.div
              className="card branch right"
              onClick={() => navigate("/act")}
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              ACT
            </motion.div>

          </motion.div>
        )}

        {/* ================= GRAD VIEW ================= */}
        {view === "grad" && (
          <motion.div
            key="grad"
            className="tree-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            {/* BACK BUTTON */}
            <motion.div
              className="back"
              onClick={() => setView("root")}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <FaArrowLeft />
            </motion.div>

            {/* SVG CONNECTORS */}
            <svg className="connectors" viewBox="0 0 1200 500">
              <defs>
                <linearGradient id="gradientStroke2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#6a0dad" />
                </linearGradient>
              </defs>

              {/* LEFT CURVE */}
              <path
                d="M600 250 C 450 250, 400 250, 250 250"
                stroke="url(#gradientStroke2)"
                className="connector-path"
              />

              {/* RIGHT CURVE */}
              <path
                d="M600 250 C 750 250, 800 250, 950 250"
                stroke="url(#gradientStroke2)"
                className="connector-path"
              />
            </svg>

            {/* CENTER */}
            <motion.div
              className="card center active"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <FaChartLine className="icon" />
              Graduate
            </motion.div>

            {/* LEFT */}
            <motion.div
              className="card branch left"
              onClick={() => navigate("/gre")}
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              GRE
            </motion.div>

            {/* RIGHT */}
            <motion.div
              className="card branch right"
              onClick={() => navigate("/gmat")}
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              GMAT
            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default StandardizedTests;