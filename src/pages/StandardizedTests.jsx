import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaGraduationCap, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./StandardizedTests.css";

const StandardizedTests = () => {
  const [view, setView] = useState("root");
  const navigate = useNavigate();

  return (
      <div className="tests-container">
  
  {/* BACKGROUND ANIMATION */}
  <div className="bg-animation">
    {[...Array(25)].map((_, i) => (
      <span
        key={i}
        style={{
          left: Math.random() * 100 + "%",
          animationDuration: 6 + Math.random() * 10 + "s",
          animationDelay: Math.random() * 5 + "s"
        }}
      />
    ))}
  </div>

      <h1 className="title">Standardized Tests</h1>

      <AnimatePresence mode="wait">

        {/* ROOT */}
        {view === "root" && (
          <motion.div
            key="root"
            className="cards-root"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
          >
            <div className="card root-card" onClick={() => setView("undergrad")}>
              <FaGraduationCap className="icon" />
              Undergraduate
            </div>

            <div className="card root-card" onClick={() => setView("grad")}>
              <FaChartLine className="icon" />
              Graduate
            </div>
          </motion.div>
        )}

        {/* UNDERGRAD */}
        {view === "undergrad" && (
          <motion.div
            key="undergrad"
            className="tree-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="back" onClick={() => setView("root")}>
              <FaArrowLeft />
            </div>

            {/* SVG CONNECTORS */}
            <svg className="connectors" viewBox="0 0 900 400">
              <defs>
                <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#6a0dad" />
                </linearGradient>
              </defs>

              <path
                d="M450 200 C 350 200, 300 200, 200 200"
                className="connector-path"
              />

              <path
                d="M450 200 C 550 200, 600 200, 700 200"
                className="connector-path"
              />
            </svg>

            {/* CENTER */}
            <motion.div
              className="card center active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaGraduationCap className="icon" />
              Undergraduate
            </motion.div>

            {/* LEFT */}
            <motion.div
              className="card branch left"
              onClick={() => navigate("/sat")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              SAT / AP
            </motion.div>

            {/* RIGHT */}
            <motion.div
              className="card branch right"
              onClick={() => navigate("/act")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ACT
            </motion.div>
                      </motion.div>
        )}

        {/* GRAD */}
        {view === "grad" && (
          <motion.div
            key="grad"
            className="tree-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="back" onClick={() => setView("root")}>
              <FaArrowLeft />
            </div>

            {/* SVG CONNECTORS */}
            <svg className="connectors" viewBox="0 0 900 400">
              <defs>
                <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#6a0dad" />
                </linearGradient>
              </defs>

              <path
                d="M450 200 C 350 200, 300 200, 200 200"
                className="connector-path"
              />

              <path
                d="M450 200 C 550 200, 600 200, 700 200"
                className="connector-path"
              />
            </svg>

            {/* CENTER */}
            <motion.div
              className="card center active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaChartLine className="icon" />
              Graduate
            </motion.div>

            {/* LEFT */}
            <motion.div
              className="card branch left"
              onClick={() => navigate("/gre")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              GRE
            </motion.div>

            {/* RIGHT */}
            <motion.div
              className="card branch right"
              onClick={() => navigate("/gmat")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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