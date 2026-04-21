import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./EnglishProficiency.css";

export default function EnglishProficiency() {
  const navigate = useNavigate();

  // ✅ Mouse Glow (stable)
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

  // ✅ Stable 3D Tilt (no flicker)
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
    <div className="tests-container">
      <div className="mouse-glow"></div>

      <h1 className="title">English Proficiency Tests</h1>

      <div className="card-grid">
        {tests.map((test) => (
          <div
            key={test.name}
            className="test-card"
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