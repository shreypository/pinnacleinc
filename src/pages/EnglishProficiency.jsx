import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./EnglishProficiency.css";

export default function EnglishProficiency() {
  const navigate = useNavigate();

  // 🖱️ Mouse Glow (scoped)
  useEffect(() => {
    const move = (e) => {
      const glow = document.querySelector(".ep-mouse-glow");

      if (glow) {
        glow.style.left = e.clientX - 150 + "px";
        glow.style.top = e.clientY - 150 + "px";
      }
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // ✨ Particle interaction (scoped)
  useEffect(() => {
    const particles = document.querySelectorAll(".ep-particle");

    const handleMove = (e) => {
      particles.forEach((p) => {
        const rect = p.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          p.style.transform = `translate(${-dx * 0.05}px, ${-dy * 0.05}px)`;
        } else {
          p.style.transform = `translate(0,0)`;
        }
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // 🎯 3D Tilt (clean + stable)
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

  const tests = [
    {
      name: "IELTS",
      desc: "International English Language Testing System",
      path: "/ielts",
    },
    {
      name: "TOEFL",
      desc: "Test of English as a Foreign Language",
      path: "/toefl",
    },
    {
      name: "PTE",
      desc: "Pearson Test of English",
      path: "/pte",
    },
  ];

  return (
    <div className="ep-container">

      {/* ✨ Particles */}
      <div className="ep-particles">
        {[...Array(20)].map((_, i) => (
          <span className="ep-particle" key={i}></span>
        ))}
      </div>

      {/* 🖱️ Mouse Glow */}
      <div className="ep-mouse-glow"></div>

      {/* 🔥 Centered Title */}
      <h1 className="ep-title">English Proficiency Tests</h1>

      {/* 🧩 Cards */}
      <div className="ep-grid">
        {tests.map((test) => (
          <div
            key={test.name}
            className="ep-card"
            onClick={() => navigate(test.path)}
            onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
            onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
          >
            <h2>{test.name}</h2>
            <p>{test.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}