import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./Services.css";

export default function Services() {
  const navigate = useNavigate();

  // Mouse glow
  useEffect(() => {
    const move = (e) => {
      const glow = document.querySelector(".mouse-glow");
      if (glow) {
        glow.style.left = e.clientX - 140 + "px";
        glow.style.top = e.clientY - 140 + "px";
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Particle mouse repel
  useEffect(() => {
    const particles = document.querySelectorAll(".particle");

    const handleMove = (e) => {
      particles.forEach((p) => {
        const rect = p.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          p.style.transform = `translate(${-dx * 0.05}px, ${-dy * 0.05}px)`;
        } else {
          p.style.transform = `translate(0, 0)`;
        }
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // 3D tilt
  const handleMouseMove = (e, card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = (y - rect.height / 2) / 20;
    const rotateY = (rect.width / 2 - x) / 20;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  };

  const handleMouseLeave = (card) => {
    card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

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

  return (
    <div className="services-container">

      {/* Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <span className="particle" key={i}></span>
        ))}
      </div>

      {/* Mouse glow */}
      <div className="mouse-glow"></div>

      {/* Title */}
      <h1 className="services-title">Additional Services</h1>

      {/* Cards */}
      <div className="card-grid">
        {services.map((service, index) => (
          <div
            key={service.name}
            className="service-card"
            style={{ animationDelay: `${0.3 + index * 0.15}s` }}
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
