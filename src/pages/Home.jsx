// Home.jsx

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./Home.css";
import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from "../firebase.js";

export default function Home() {

  const navigate = useNavigate();
  const [visitors, setVisitors] = useState(0);

  // ================= STATS REF =================

  const statsRef = useRef(null);

  // ================= FINAL STATS =================

  const finalStats = [
    {
      value: 1550,
      suffix: "+",
      label: "Average SAT Score",
    },
    {
      value: 5,
      suffix: "/5",
      label: "AP Scores",
    },
    {
      value: 8.5,
      suffix: "+",
      label: "IELTS Band",
    },
    {
      value: 100,
      suffix: "+",
      label: "Students Placed",
    },
  ];

  // ================= INITIAL VALUES =================

  const [stats, setStats] = useState([
    "0",
    "0",
    "0",
    "0",
  ]);

  // ================= RANDOM STATS ANIMATION =================
  useEffect(() => {

  const updateVisitorCount = async () => {

    const visitorRef = doc(db, "analytics", "visitors");

    const visitorSnap = await getDoc(visitorRef);

    if (!visitorSnap.exists()) {

      await setDoc(visitorRef, {
        count: 1
      });

      setVisitors(1);

    } else {

      await updateDoc(visitorRef, {
        count: increment(1)
      });

      const updatedSnap = await getDoc(visitorRef);

      setVisitors(updatedSnap.data().count);
    }
  };

  updateVisitorCount();

}, []);


  useEffect(() => {

    let started = false;

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting && !started) {

          started = true;

          const interval = setInterval(() => {

            setStats([
              Math.floor(Math.random() * 1600),
              (Math.random() * 5).toFixed(1),
              (Math.random() * 9).toFixed(1),
              Math.floor(Math.random() * 150),
            ]);

          }, 80);

          setTimeout(() => {

            clearInterval(interval);

            setStats([
              finalStats[0].value,
              finalStats[1].value,
              finalStats[2].value,
              finalStats[3].value,
            ]);

          }, 1800);
        }
      },
      {
        threshold: 0.4,
      }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();

  }, []);

  // ================= PROGRAMS =================

  const programs = [
    {
      title: "SAT / AP",
      desc: "Comprehensive coaching with proven strategies for top SAT and AP scores.",
      path: "/sat",
    },
    {
      title: "IELTS / TOEFL",
      desc: "Structured preparation programs for IELTS and TOEFL success.",
      path: "/english-tests",
    },
    {
      title: "ACT",
      desc: "Expert ACT preparation with personalized mentorship and mock tests.",
      path: "/act",
    },
    {
      title: "GRE",
      desc: "Advanced GRE coaching for students aiming for global universities.",
      path: "/gre",
    },
    {
      title: "GMAT",
      desc: "Targeted GMAT preparation with strategic problem-solving methods.",
      path: "/gmat",
    },
    {
      title: "COUNSELLING",
      desc: "Profile building, college selection, SOP guidance, and applications.",
      path: "/college",
    },
    {
      title: "VISA SERVICES",
      desc: "End-to-end visa guidance and documentation support.",
      path: "/visa",
    },
  ];

  // ================= SCROLL TO PROGRAMS =================

  const scrollToPrograms = () => {

    const section = document.getElementById("programs");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <>

{/* ================= HERO SECTION ================= */}

<section className="home-hero">

  <div className="container hero-content">

    {/* ================= LEFT SIDE ================= */}

    <motion.div
      className="hero-text"
      initial={{ opacity: 0, y: 70 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >

      <h1>
        Reach Your <span>Global Peak</span>
      </h1>

      <p>
        Elite mentorship for SAT, ACT, GRE, GMAT,
        IELTS, TOEFL, counselling, and international
        admissions success.
      </p>

      {/* BUTTONS */}

      <div className="hero-buttons">

        <button
          className="primary-btn"
          onClick={scrollToPrograms}
        >
          Get Started
        </button>

        <button
          className="secondary-btn"
          onClick={() => navigate("/contact")}
        >
          Contact Us
        </button>

      </div>

    </motion.div>

    {/* ================= RIGHT SIDE ================= */}

    <motion.div
      className="hero-visual"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >

      {/* GLOW */}

      <div className="hero-glow"></div>

      {/* VISITOR COUNTER */}

      <div className="visitor-section">

        <div className="visitor-card">

          <h2>{visitors}+</h2>

          <p>Visitors Worldwide</p>

        </div>

      </div>

    </motion.div>

  </div>

</section>

      {/* ================= RESULTS SECTION ================= */}

      <section
        className="results-section"
        ref={statsRef}
      >

        <div className="container">

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            Our Results Speak for Themselves
          </motion.h2>

          <div className="results-grid">

            {finalStats.map((item, index) => (

              <motion.div
                className="result-card"
                key={index}
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.15,
                }}
                viewport={{ once: true }}
              >

                <h3>
                  {stats[index]}
                  {item.suffix}
                </h3>

                <p>{item.label}</p>

              </motion.div>

            ))}

          </div>

          <div className="results-btn">

            <button
              className="primary-btn"
              onClick={() => navigate("/results")}
            >
              View Full Results
            </button>

          </div>

        </div>

      </section>

      {/* ================= PROGRAMS SECTION ================= */}

      <section
        className="programs-section"
        id="programs"
      >

        <div className="container">

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            Our Programs
          </motion.h2>

          <div className="programs-grid">

            {programs.map((program, index) => (

              <motion.div
                className="program-card"
                key={index}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                onClick={() => navigate(program.path)}
              >

                <h3>{program.title}</h3>

                <p>{program.desc}</p>

                <span>Explore →</span>

              </motion.div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

<footer className="footer">

  <div className="container footer-content">

    {/* LEFT */}

    <div className="footer-left">

      <h3>Pinnacle Incorporated</h3>

      <p>
        Helping students achieve global academic
        success through expert mentorship,
        strategic guidance, and personalized
        international admissions support.
      </p>

    </div>

    {/* QUICK LINKS */}

    <div className="footer-links">

      <h4>Quick Links</h4>

      <a href="/">Home</a>
      <a href="/results">Results</a>
      <a href="/contact">Contact</a>
      <a href="/services">Services</a>

    </div>

    {/* FOUNDERS */}

    <div className="footer-contact">

      <h4>Founders</h4>

      <p>
        <strong>Purusharth Agarwal</strong><br />
        Academic & Executive Founder
      </p>

      <p>
        ✉ purusharth@pinnacleinc.co
      </p>

      <br />

      <p>
        <strong>Chethan M</strong><br />
        Business & Strategic Founder
      </p>

      <p>
        ✉ chethan@pinnacleinc.co
      </p>

      <br />

      <p>
        📞 +91 9731490933
      </p>

    </div>

  </div>

  {/* BOTTOM */}

  <div className="footer-bottom">

    <p>
      © 2026 Pinnacle Incorporated.
      All rights reserved.
    </p>

  </div>

</footer>

    </>
  );
}