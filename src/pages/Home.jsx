import { motion } from "framer-motion";

export default function Home() {
  return (
    <section className="hero">

      <div className="container hero-content">

        {/* LEFT SIDE */}
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
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

      </div>

    </section>
  );
}