import { motion, useScroll, useTransform } from "framer-motion";
import "./About.css";

export default function About() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);

  return (
    <section className="about-page">

      {/* Animated Background */}
      <motion.div style={{ y }} className="about-bg"></motion.div>

      <div className="container">

        {/* HERO */}
        <motion.div
          className="about-hero"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1>About Pinnacle</h1>
          <p>
            Empowering students to reach their global peak through strategy,
            mentorship, and results-driven preparation.
          </p>
        </motion.div>

        {/* STORY */}
        <div className="about-story">

          <motion.div
            className="story-text glass"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2>Our Story</h2>
            <p>
              Pinnacle was founded to help students unlock their true potential
              and achieve global academic success.
            </p>
          </motion.div>

          <motion.div
            className="story-box glass"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h3>Our Mission</h3>
            <p>
              To provide personalized mentorship that ensures every student
              reaches their highest potential.
            </p>
          </motion.div>

        </div>

        {/* WHY */}
        <motion.div
          className="about-why glass"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2>Why We Started</h2>
          <p>
            We bridge the gap between student potential and real results
            with a structured, student-first approach.
          </p>
        </motion.div>

        {/* TIMELINE */}
        <div className="timeline-section">
          <h2>Our Journey</h2>

          <div className="timeline">

            <div className="timeline-item">
              <div className="dot"></div>
              <div className="content">
                <h3>2022</h3>
                <p>Founded with a vision to guide students globally.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="dot"></div>
              <div className="content">
                <h3>2023</h3>
                <p>Expanded to SAT, IELTS, and AP preparation.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="dot"></div>
              <div className="content">
                <h3>2024</h3>
                <p>Helped students achieve global placements.</p>
              </div>
            </div>

          </div>
        </div>

        {/* FOUNDERS */}
        <div className="founders">
          <h2>Meet the Founders</h2>

          <div className="founders-grid">

            <motion.div className="founder-card glass" whileHover={{ scale: 1.05 }}>
              <div className="founder-image"></div>
              <h3>Founder 1</h3>
              <p>Expert in SAT/AP strategy.</p>
            </motion.div>

            <motion.div className="founder-card glass" whileHover={{ scale: 1.05 }}>
              <div className="founder-image"></div>
              <h3>Founder 2</h3>
              <p>Mentor guiding global success.</p>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}