import { motion } from "framer-motion";

export default function About() {
  return (
    <section className="about-page">
      <div className="container">

        {/* HERO / INTRO */}
        <motion.div
          className="about-hero"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>About Pinnacle Incorporation</h1>
          <p>
            Empowering students to reach their global peak through strategy,
            mentorship, and results-driven preparation.
          </p>
        </motion.div>

        {/* STORY SECTION */}
        <div className="about-story">

          <motion.div
            className="story-text"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Our Story</h2>
            <p>
              Pinnacle Incorporation was founded with a simple vision — to help
              students unlock their true potential and achieve global academic success.
            </p>
            <p>
              With increasing competition in exams like SAT, AP, IELTS, and TOEFL,
              students often struggle to find structured guidance and personalized mentorship.
            </p>
          </motion.div>

          <motion.div
            className="story-box"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3>Our Mission</h3>
            <p>
              To provide personalized, high-impact mentorship that ensures every
              student reaches their highest potential.
            </p>
          </motion.div>

        </div>

        {/* WHY SECTION */}
        <motion.div
          className="about-why"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Why We Started</h2>
          <p>
            We noticed that students had the capability to achieve top scores,
            but lacked direction. Pinnacle was built to bridge that gap with
            a structured, student-first approach.
          </p>
        </motion.div>

        {/* FOUNDERS */}
        <div className="founders">

          <h2>Meet the Founders</h2>

          <div className="founders-grid">

            <motion.div
              className="founder-card"
              whileHover={{ scale: 1.05 }}
            >
              <div className="founder-image"></div>
              <h3>Founder Name 1</h3>
              <p>
                Expert in SAT/AP preparation with a strong focus on strategy and performance.
              </p>
            </motion.div>

            <motion.div
              className="founder-card"
              whileHover={{ scale: 1.05 }}
            >
              <div className="founder-image"></div>
              <h3>Founder Name 2</h3>
              <p>
                Passionate mentor guiding students toward global university success.
              </p>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}