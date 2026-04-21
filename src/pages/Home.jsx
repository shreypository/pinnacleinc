import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      {/* 🔥 HERO SECTION */}
      <section className="hero">
        <div className="container hero-content">

          {/* LEFT SIDE */}
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>
              Reach Your <span>Global Peak</span>
            </h1>

            <p>
              Expert guidance for SAT, AP, IELTS, and TOEFL with proven results and personalized mentorship.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn">Get Started</button>
              <button className="secondary-btn">Contact Us</button>
            </div>
          </motion.div>

          {/* RIGHT SIDE VISUAL */}
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glow-circle"></div>
          </motion.div>

        </div>
      </section>

      {/* 📊 RESULTS SECTION */}
      <section className="results">
        <div className="container">

          <h2>Our Results Speak for Themselves</h2>

          <div className="results-grid">

            <div className="result-card">
              <h3>1550+</h3>
              <p>Average SAT Score</p>
            </div>

            <div className="result-card">
              <h3>5/5</h3>
              <p>AP Scores</p>
            </div>

            <div className="result-card">
              <h3>8.5+</h3>
              <p>IELTS Band</p>
            </div>

            <div className="result-card">
              <h3>100+</h3>
              <p>Students Placed</p>
            </div>

          </div>

          {/* BUTTON */}
          <div style={{ marginTop: "30px" }}>
            <a href="/results" className="primary-btn">
              View Full Results
            </a>
          </div>

        </div>
      </section>

      {/* 🎯 PROGRAMS SECTION */}
      <section className="programs">
        <div className="container">

          <h2>Our Programs</h2>

          <div className="programs-grid">

            <div className="program-card">
              <h3>SAT / AP Preparation</h3>
              <p>
                Comprehensive coaching with proven strategies to achieve top scores in SAT and AP exams.
              </p>
              <a href="/sat-ap">Learn More →</a>
            </div>

            <div className="program-card">
              <h3>IELTS / TOEFL</h3>
              <p>
                Structured programs to help you achieve your target band score with confidence.
              </p>
              <a href="/ielts-toefl">Learn More →</a>
            </div>

            <div className="program-card">
              <h3>Additional Services</h3>
              <p>
                College applications, essays, profile building, and personalized mentorship.
              </p>
              <a href="/services">Explore →</a>
            </div>

          </div>

        </div>
      </section>

      <footer className="footer">

  <div className="container footer-content">

    <div className="footer-left">
      <h3>Pinnacle Incorporated</h3>
      <p>
        Helping students achieve global academic success through expert guidance and proven strategies.
      </p>
    </div>

    <div className="footer-links">
      <h4>Quick Links</h4>
      <a href="/">Home</a>
      <a href="/results">Results</a>
      <a href="/sat-ap">SAT/AP</a>
      <a href="/ielts-toefl">IELTS/TOEFL</a>
      <a href="/contact">Contact</a>
    </div>

    <div className="footer-contact">
      <h4>Contact</h4>
      <p>Email: info@pinnacleinc.co</p>
      <p>Phone: +91 XXXXX XXXXX</p>
    </div>

  </div>

  <div className="footer-bottom">
    <p>© 2026 Pinnacle Incorporated. All rights reserved.</p>
  </div>

</footer>

    </>
  );
}