import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function Results() {

  // ================= FINAL STATS =================

  const finalStats = [
    {
      value: "1550+",
      label: "Average SAT Score",
    },
    {
      value: "5/5",
      label: "AP Scores",
    },
    {
      value: "8.5+",
      label: "IELTS Band",
    },
    {
      value: "110+",
      label: "TOEFL Score",
    },
  ];

  // ================= ANIMATED STATS =================

  const [stats, setStats] = useState([
    "0",
    "0",
    "0",
    "0",
  ]);

  const statsRef = useRef(null);

  // ================= RANDOM NUMBER EFFECT =================

  useEffect(() => {

    let started = false;

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting && !started) {

          started = true;

          const interval = setInterval(() => {

            setStats([
              `${Math.floor(Math.random() * 1600)}+`,
              `${(Math.random() * 5).toFixed(1)}/5`,
              `${(Math.random() * 9).toFixed(1)}+`,
              `${Math.floor(Math.random() * 120)}+`,
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

  return (

    <section className="results-page">

      <div className="container">

        {/* ================= HEADER ================= */}

        <motion.div
          className="results-header"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >

          <h1>Our Results</h1>

          <p>
            Our students consistently achieve top scores across
            SAT, AP, IELTS, TOEFL, GRE, and GMAT examinations.
          </p>

        </motion.div>

        {/* ================= STATS ================= */}

        <div
          className="results-stats"
          ref={statsRef}
        >

          {finalStats.map((item, index) => (

            <motion.div
              key={index}
              className="result-box"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: index * 0.12,
              }}
              viewport={{ once: true }}
            >

              <h2>{stats[index]}</h2>

              <p>{item.label}</p>

            </motion.div>

          ))}

        </div>

        {/* ================= STUDENT RESULTS ================= */}

        <div className="student-results">

          <motion.h2
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Student Achievements
          </motion.h2>

          <div className="student-grid">

            {[
              {
                name: "Riya Sharma",
                score: "SAT: 1540",
                uni: "Admitted to NYU"
              },
              {
                name: "Arjun Mehta",
                score: "IELTS: 8.5",
                uni: "Admitted to University of Toronto"
              },
              {
                name: "Neha Kapoor",
                score: "AP: 5/5",
                uni: "Admitted to UCLA"
              },
              {
                name: "Karan Patel",
                score: "TOEFL: 112",
                uni: "Admitted to Columbia University"
              }
            ].map((student, index) => (

              <motion.div
                key={index}
                className="student-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.12,
                }}
                viewport={{ once: true }}
              >

                <h3>{student.name}</h3>

                <p>{student.score}</p>

                <p>{student.uni}</p>

              </motion.div>

            ))}

          </div>

        </div>

        {/* ================= TESTIMONIALS ================= */}

        <div className="testimonials">

          <motion.h2
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            What Our Students Say
          </motion.h2>

          <div className="testimonial-grid">

            {[
              {
                text: "The SAT training completely changed my approach. I improved from 1350 to 1540!",
                name: "Riya Sharma"
              },
              {
                text: "IELTS coaching was extremely structured. I achieved an 8.5 band in my first attempt.",
                name: "Arjun Mehta"
              },
              {
                text: "Their guidance for college applications was invaluable. Got into my dream university!",
                name: "Neha Kapoor"
              }
            ].map((item, index) => (

              <motion.div
                key={index}
                className="testimonial-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.12,
                }}
                viewport={{ once: true }}
              >

                <p>"{item.text}"</p>

                <h4>- {item.name}</h4>

              </motion.div>

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}