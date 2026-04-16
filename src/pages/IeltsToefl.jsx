import { motion } from "framer-motion";

export default function IeltsToefl() {
  return (
    <section className="ielts-page">

      <div className="container">

        {/* HERO */}
        <motion.div
          className="ielts-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>IELTS / TOEFL Preparation</h1>
          <p>
            Achieve your target band score with structured training, expert feedback, and proven techniques.
          </p>
        </motion.div>

        {/* FEATURES */}
        <div className="ielts-features">

          <h2>What We Offer</h2>

          <div className="ielts-grid">

            <div className="ielts-card">
              <h3>Speaking Practice</h3>
              <p>Real-time speaking sessions with detailed feedback.</p>
            </div>

            <div className="ielts-card">
              <h3>Writing Evaluation</h3>
              <p>Essay corrections with band-level insights.</p>
            </div>

            <div className="ielts-card">
              <h3>Listening & Reading</h3>
              <p>Strategies to improve accuracy and speed.</p>
            </div>

          </div>

        </div>

        {/* PROCESS */}
        <div className="ielts-process">

          <h2>Our Approach</h2>

          <div className="ielts-steps">

            <div className="step">
              <h3>1. Diagnostic Test</h3>
              <p>Understand your current band level.</p>
            </div>

            <div className="step">
              <h3>2. Skill Training</h3>
              <p>Focused sessions for each module.</p>
            </div>

            <div className="step">
              <h3>3. Practice Tests</h3>
              <p>Simulated exams under real conditions.</p>
            </div>

            <div className="step">
              <h3>4. Final Review</h3>
              <p>Targeted improvements before exam.</p>
            </div>

          </div>

        </div>

        {/* CTA */}
        <div className="ielts-cta">
          <h2>Get Your Target Band Score</h2>
          <button className="primary-btn">Enroll Now</button>
        </div>

      </div>

    </section>
  );
}