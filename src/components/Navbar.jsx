// src/components/Navbar.jsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Navbar() {

  const links = [
  { name: "Home", path: "/" },
  { name: "Our Results", path: "/results" },
  { name: "SAT/AP", path: "/sat-ap" },
  { name: "IELTS/TOEFL", path: "/ielts-toefl" },
  { name: "Additional Services", path: "/services" },
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
  { name: "Student Login", path: "/login" } // now last
];

  return (
    <div className="navbar">

      {/* 🔝 Top Branding */}
      <div className="nav-top container">
        <div className="logo-section">
          <img src="/logo.png" alt="logo" className="logo" />
          <h1>Pinnacle Incorporation</h1>
        </div>
      </div>

      {/* 🔽 Navigation Menu */}
      <div className="nav-bottom">
        <div className="container nav-links">

          {links.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                to={item.path}
                className={item.name === "Student Login" ? "login-btn" : ""}
              >
                {item.name}
              </Link>
            </motion.div>
          ))}

        </div>
      </div>

    </div>
  );
}