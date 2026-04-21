import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {

  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // scrolling down
        setShowNavbar(false);
      } else {
        // scrolling up
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const links = [
    { name: "Home", path: "/" },
    { name: "Our Results", path: "/results" },
    { name: "Standardized Tests", path: "/standardized-tests" },
    { name: "English Proficiency", path: "/english" },
    { name: "Counselling", path: "/counselling" },
    { name: "Additional Services", path: "/services" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
    { name: "Student Login", path: "/login" }
  ];

  return (
    <div className={`navbar ${showNavbar ? "show" : "hide"}`}>
      <div className="nav-container">

        <div className="nav-left">
          <div className="logo-section">
            <img src="/logo.png" alt="logo" className="logo" />
            <h1>Pinnacle Inc</h1>
          </div>
        </div>

        <div className="nav-right">
          <div className="nav-links">
            {links.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function NavItem({ item }) {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <motion.div whileHover={{ scale: 1.08 }}>
      <Link
        to={item.path}
        className={`nav-link ${isActive ? "active" : ""} ${
          item.name === "Student Login" ? "login-btn" : ""
        }`}
      >
        {item.name}
      </Link>
    </motion.div>
  );
}
