import { motion } from "framer-motion";

export default function Results() {
  return (
    <section className="results-page">
      <div className="container">

        {/* HEADER */}
        <motion.div
          className="results-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Our Results</h1>
          <p>
            Our students consistently achieve top scores across SAT, AP, IELTS, and TOEFL.
          </p>
        </motion.div>

        {/* STATS */}
        <div className="results-stats">

          {[
            { score: "1550+", label: "Average SAT Score" },
            { score: "5/5", label: "AP Scores" },
            { score: "8.5+", label: "IELTS Band" },
            { score: "110+", label: "TOEFL Score" }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="result-box"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h2>{item.score}</h2>
              <p>{item.label}</p>
            </motion.div>
          ))}

        </div>

        {/* STUDENT RESULTS */}
        <div className="student-results">
          <h2>Student Achievements</h2>

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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3>{student.name}</h3>
                <p>{student.score}</p>
                <p>{student.uni}</p>
              </motion.div>
            ))}

          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="testimonials">
          <h2>What Our Students Say</h2>

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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
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