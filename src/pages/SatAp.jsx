import { motion } from "framer-motion";

export default function SatAp() {
  return (
    <section className="satap-page">

      <div className="container">

        {/* HERO */}
        <motion.div
          className="satap-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>SAT / AP Preparation</h1>
          <p>
            Achieve top scores with structured guidance, expert mentorship, and proven strategies.
          </p>
        </motion.div>

        {/* FEATURES */}
        <div className="satap-features">

          <h2>What We Offer</h2>

          <div className="features-grid">

            <div className="feature-card">
              <h3>Personalized Study Plans</h3>
              <p>Customized strategies based on your strengths and weaknesses.</p>
            </div>

            <div className="feature-card">
              <h3>Expert Mentors</h3>
              <p>Learn from experienced instructors with proven track records.</p>
            </div>

            <div className="feature-card">
              <h3>Mock Tests & Analysis</h3>
              <p>Regular testing with detailed performance breakdowns.</p>
            </div>

          </div>

        </div>

        {/* PROCESS */}
        <div className="satap-process">

          <h2>How It Works</h2>

          <div className="process-steps">

            <div className="step">
              <h3>1. Assessment</h3>
              <p>We evaluate your current level and identify key areas.</p>
            </div>

            <div className="step">
              <h3>2. Training</h3>
              <p>Structured sessions focusing on concepts and strategies.</p>
            </div>

            <div className="step">
              <h3>3. Testing</h3>
              <p>Mock exams with feedback to improve performance.</p>
            </div>

            <div className="step">
              <h3>4. Final Boost</h3>
              <p>Last-stage refinement to maximize your score.</p>
            </div>

          </div>

        </div>

        {/* CTA */}
        <div className="satap-cta">
          <h2>Start Your Journey Today</h2>
          <button className="primary-btn">Enroll Now</button>
        </div>

      </div>

    </section>
  );
}