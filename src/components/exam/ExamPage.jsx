import { useEffect, useRef } from "react";
import BlogCarousel from "./BlogCarousel";
import "./ExamPage.css";

/*
  ExamPage — shared template for all 7 exam pages.
  Pass a config object with exam-specific data.

  config shape:
  {
    key:      "GRE",                      // matches blog category key
    name:     "GRE",                      // display name
    fullName: "Graduate Record Examination", // optional long name
    org:      "ETS",                      // conducting organization
    website:  "https://www.ets.org/gre",  // official site
    tagline:  "Graduate admissions test", // one-liner
    abbr:     "GRE"                       // logo abbreviation (2-3 chars)
  }
*/
export default function ExamPage({ config }) {
  const glowRef = useRef(null);
  const containerRef = useRef(null);

  // Mouse glow effect
  useEffect(() => {
    const move = (e) => {
      if (glowRef.current) {
        glowRef.current.style.left = e.clientX - 140 + "px";
        glowRef.current.style.top  = e.clientY - 140 + "px";
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Particle mouse repel
  useEffect(() => {
    const handleMove = (e) => {
      const particles = containerRef.current?.querySelectorAll(".exam-particle") ?? [];
      particles.forEach((p) => {
        const rect = p.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width  / 2);
        const dy = e.clientY - (rect.top  + rect.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        p.style.transform = dist < 120
          ? `translate(${-dx * 0.05}px, ${-dy * 0.05}px)`
          : "translate(0, 0)";
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Scroll-reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); observer.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    containerRef.current?.querySelectorAll(".scroll-reveal")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="exam-page" ref={containerRef}>

      {/* Ambient particles */}
      <div className="exam-particles" aria-hidden="true">
        {[...Array(20)].map((_, i) => <span className="exam-particle" key={i} />)}
      </div>

      {/* Mouse glow */}
      <div className="exam-mouse-glow" ref={glowRef} aria-hidden="true" />

      {/* ── HERO: Official Exam Info ── */}
      <section className="exam-hero">
        <div className="exam-info-card scroll-reveal">
          {/* Logo mark */}
          <div className="exam-logo-mark" aria-label={`${config.name} logo`}>
            {config.abbr || config.name.slice(0, 3)}
          </div>

          <div className="exam-info-text">
            <h1 className="exam-name">{config.name}</h1>
            {config.fullName && (
              <p className="exam-full-name">{config.fullName}</p>
            )}
            <p className="exam-org">by <strong>{config.org}</strong></p>
            {config.tagline && (
              <p className="exam-tagline">{config.tagline}</p>
            )}
          </div>

          <a
            href={config.website}
            target="_blank"
            rel="noopener noreferrer"
            className="exam-official-btn"
          >
            Visit Official Website
            <span className="exam-btn-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* ── BLOG INSIGHTS ── */}
      <section className="exam-blogs-section scroll-reveal reveal-delay-2">
        <div className="exam-section-header">
          <h2 className="exam-section-title">Blog Insights</h2>
          <p className="exam-section-sub">
            Expert tips, updates, and guidance for {config.name} aspirants
          </p>
        </div>

        <BlogCarousel category={config.key} examName={config.name} />
      </section>

    </div>
  );
}
