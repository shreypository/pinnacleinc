import { useState, useEffect, useRef, useCallback } from "react";
import { API } from "../../services/api";
import BlogModal from "./BlogModal";
import "./BlogCarousel.css";

const INTERVAL_MS = 7000; // 7 seconds auto-advance

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/* ── Fetch blogs for a specific exam category ─────────────────────── */
async function fetchByCategory(category) {
  const res = await fetch(`${API}/api/blog/category/${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

/* ── Fetch full blog content by ID ───────────────────────────────── */
async function fetchBlogById(id) {
  const res = await fetch(`${API}/api/blog/id/${id}`);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export default function BlogCarousel({ category, examName }) {
  const [blogs,     setBlogs]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);
  const [current,   setCurrent]   = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("next"); // "next" | "prev"
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loadingBlog,  setLoadingBlog]  = useState(false);

  const hovered  = useRef(false);
  const timerRef = useRef(null);
  // Touch swipe
  const touchStartX = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchByCategory(category)
      .then((data) => { setBlogs(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [category]);

  const goTo = useCallback((idx, dir = "next") => {
    if (animating || blogs.length <= 1) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 380); // matches CSS transition
  }, [animating, blogs.length]);

  const goNext = useCallback(() =>
    goTo((current + 1) % blogs.length, "next"),
    [goTo, current, blogs.length]);

  const goPrev = useCallback(() =>
    goTo((current - 1 + blogs.length) % blogs.length, "prev"),
    [goTo, current, blogs.length]);

  // Auto-advance
  useEffect(() => {
    if (blogs.length <= 1) return;
    timerRef.current = setInterval(() => {
      if (!hovered.current) goNext();
    }, INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [blogs.length, goNext]);

  const pauseTimer = () => { hovered.current = true; };
  const resumeTimer = () => { hovered.current = false; };

  // Touch swipe
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  const openBlog = async (blog) => {
    setLoadingBlog(true);
    try {
      const full = await fetchBlogById(blog._id);
      setSelectedBlog(full);
    } catch {
      setSelectedBlog(blog); // fallback: show without full content
    } finally {
      setLoadingBlog(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="bc-loading">
        <div className="bc-spinner" />
        <p>Loading insights…</p>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="bc-empty">
        <div className="bc-empty-icon">⚠️</div>
        <p className="bc-empty-title">Could not load blogs</p>
        <p className="bc-empty-sub">Please check your connection and try again.</p>
      </div>
    );
  }

  // ── Empty state ──
  if (blogs.length === 0) {
    return (
      <div className="bc-empty">
        <div className="bc-empty-icon">✦</div>
        <h3 className="bc-empty-title">Blog Insights Coming Soon</h3>
        <p className="bc-empty-sub">Stay updated with expert content for {examName}</p>
        <ul className="bc-empty-list">
          <li>Exam updates & score insights</li>
          <li>Preparation strategies & tips</li>
          <li>Official announcement summaries</li>
          <li>Application & registration guidance</li>
          <li>Study schedules & resources</li>
        </ul>
      </div>
    );
  }

  const blog = blogs[current];

  return (
    <>
      <div
        className="bc-carousel"
        onMouseEnter={pauseTimer}
        onMouseLeave={resumeTimer}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── Navigation arrows ── */}
        {blogs.length > 1 && (
          <>
            <button className="bc-nav bc-nav-prev" onClick={goPrev} aria-label="Previous blog">
              ←
            </button>
            <button className="bc-nav bc-nav-next" onClick={goNext} aria-label="Next blog">
              →
            </button>
          </>
        )}

        {/* ── Featured card ── */}
        <div className={`bc-card-wrap bc-dir-${direction} ${animating ? "bc-animating" : ""}`}>
          <article className="bc-card">
            {/* Thumbnail */}
            <div className="bc-thumb">
              {blog.featuredImage?.url ? (
                <img
                  src={`${API}${blog.featuredImage.url}`}
                  alt={blog.title}
                  loading="lazy"
                  className="bc-thumb-img"
                />
              ) : (
                <div className="bc-thumb-placeholder">
                  <span>{blog.blogType === "PDF" ? "📄" : "✦"}</span>
                </div>
              )}
              <span className={`bc-type-badge ${blog.blogType === "PDF" ? "is-pdf" : "is-text"}`}>
                {blog.blogType === "PDF" ? "PDF" : "Article"}
              </span>
            </div>

            {/* Content */}
            <div className="bc-content">
              <div className="bc-meta">
                <span className="bc-category">{blog.category}</span>
                <span className="bc-date">{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
              <h3 className="bc-title">{blog.title}</h3>
              <p className="bc-preview">
                {blog.seoDescription || `By ${blog.author}`}
              </p>
              <button
                className="bc-read-btn"
                onClick={() => openBlog(blog)}
                disabled={loadingBlog}
              >
                {loadingBlog ? "Loading…" : "Read More →"}
              </button>
            </div>
          </article>
        </div>

        {/* ── Dot indicators ── */}
        {blogs.length > 1 && (
          <div className="bc-dots">
            {blogs.map((_, i) => (
              <button
                key={i}
                className={`bc-dot ${i === current ? "bc-dot-active" : ""}`}
                onClick={() => goTo(i, i > current ? "next" : "prev")}
                aria-label={`Go to blog ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {selectedBlog && (
        <BlogModal blog={selectedBlog} onClose={() => setSelectedBlog(null)} />
      )}
    </>
  );
}
