import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./Services.css";

export default function Services() {
  const navigate = useNavigate();

  // Mouse glow effect
  useEffect(() => {
    const glow = document.querySelector(".mouse-glow");

    const move = (e) => {
      if (glow) {
        glow.style.left = e.clientX - 150 + "px";
        glow.style.top = e.clientY - 150 + "px";
      }
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Particle interaction
  useEffect(() => {
    const particles = document.querySelectorAll(".particle");

    const handleMove = (e) => {
      particles.forEach((p) => {
        const rect = p.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const moveX = -dx * 0.05;
          const moveY = -dy * 0.05;
          p.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
          p.style.transform = `translate(0,0)`;
        }
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const services = [
    {
      name: "Visa",
      desc: "Visa application and processing services",
      path: "/visa",
    },
    {
      name: "Flights & Hotels",
      desc: "Book international flights and accommodation",
      path: "/flights-hotels",
    },
    {
      name: "Travel Insurance",
      desc: "International travel insurance support",
      path: "/insurance",
    },
  ];

  // 3D tilt effect
  const handleMouseMove = (e, card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = (y - rect.height / 2) / 20;
    const rotateY = (rect.width / 2 - x) / 20;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleMouseLeave = (card) => {
    card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div className="services-container">
      {/* Background particles */}
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <span className="particle" key={i}></span>
        ))}
      </div>

      {/* Mouse glow */}
      <div className="mouse-glow"></div>

      {/* Title */}
      <h1 className="services-title">
        <span>Additional</span> <span>Services</span>
      </h1>

      {/* Cards */}
      <div className="card-grid">
        {services.map((service, index) => (
          <div
            key={service.name}
            className="service-card"
            style={{ animationDelay: `${index * 0.2}s` }}
            onClick={() => navigate(service.path)}
            onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
            onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
          >
            <h2>{service.name}</h2>
            <p>{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}