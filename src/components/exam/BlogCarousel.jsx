import { useState, useEffect, useRef, useCallback } from "react";
import { API } from "../../services/api";
import "./BlogCarousel.css";

const ROTATE_MS   = 9000;  // carousel rotation interval
const SCROLL_PPS  = 38;    // content scroll speed — pixels per second (comfortable reading)

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

async function fetchByCategory(category) {
  const res = await fetch(`${API}/api/blog/category/${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

async function fetchFull(id) {
  const res = await fetch(`${API}/api/blog/id/${id}`);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

/* ── Render plain text safely — no innerHTML ── */
function BlogBody({ content }) {
  if (!content) return null;
  return (
    <div className="bc-body">
      {content.split(/\n{2,}/).filter(Boolean).map((para, i) => (
        <p key={i}>
          {para.split("\n").map((line, j, arr) => (
            <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
          ))}
        </p>
      ))}
    </div>
  );
}

export default function BlogCarousel({ category, examName }) {
  const [blogs,          setBlogs]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(false);
  const [current,        setCurrent]        = useState(0);
  const [transitioning,  setTransitioning]  = useState(false);
  const [direction,      setDirection]      = useState("next");
  const [fullBlog,       setFullBlog]       = useState(null);  // full content of current blog
  const [contentLoading, setContentLoading] = useState(false);

  const hovered       = useRef(false);
  const rotateRef     = useRef(null);
  const rafRef        = useRef(null);
  const scrollEl      = useRef(null);
  const lastTimeRef   = useRef(null);
  const touchStartX   = useRef(null);

  /* ── Load blog list ── */
  useEffect(() => {
    setLoading(true);
    fetchByCategory(category)
      .then((data) => { setBlogs(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [category]);

  /* ── Load full content whenever current blog changes ── */
  useEffect(() => {
    if (!blogs.length) return;
    const blog = blogs[current];
    setFullBlog(null);
    setContentLoading(true);
    fetchFull(blog._id)
      .then(setFullBlog)
      .catch(() => setFullBlog(blog))
      .finally(() => setContentLoading(false));
  }, [current, blogs]);

  /* ── Auto-scroll via requestAnimationFrame ── */
  const startScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastTimeRef.current = null;

    const tick = (ts) => {
      const el = scrollEl.current;
      if (!el) return;
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = ts - lastTimeRef.current;
      lastTimeRef.current = ts;

      if (!hovered.current) {
        el.scrollTop += (SCROLL_PPS * dt) / 1000;
        // Stop when fully scrolled
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTimeRef.current = null;
  }, []);

  /* Start scroll when full content arrives */
  useEffect(() => {
    stopScroll();
    if (!fullBlog) return;
    // Small delay so DOM has painted the new content
    const t = setTimeout(() => {
      if (scrollEl.current) scrollEl.current.scrollTop = 0;
      startScroll();
    }, 120);
    return () => { clearTimeout(t); stopScroll(); };
  }, [fullBlog, startScroll, stopScroll]);

  /* ── Carousel rotation ── */
  const goTo = useCallback((idx, dir = "next") => {
    if (transitioning || blogs.length <= 1) return;
    setDirection(dir);
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 350);
  }, [transitioning, blogs.length]);

  const goNext = useCallback(() => goTo((current + 1) % blogs.length, "next"), [goTo, current, blogs.length]);
  const goPrev = useCallback(() => goTo((current - 1 + blogs.length) % blogs.length, "prev"), [goTo, current, blogs.length]);

  useEffect(() => {
    if (blogs.length <= 1) return;
    rotateRef.current = setInterval(() => { if (!hovered.current) goNext(); }, ROTATE_MS);
    return () => clearInterval(rotateRef.current);
  }, [blogs.length, goNext]);

  const pauseAll  = () => { hovered.current = true; };
  const resumeAll = () => { hovered.current = false; };

  /* Touch swipe */
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const d = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) d > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="bc-loading"><div className="bc-spinner" /><p>Loading insights…</p></div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="bc-empty">
      <div className="bc-empty-icon">⚠️</div>
      <p className="bc-empty-title">Could not load articles</p>
      <p className="bc-empty-sub">Please check your connection and refresh.</p>
    </div>
  );

  /* ── Empty ── */
  if (blogs.length === 0) return (
    <div className="bc-empty">
      <div className="bc-empty-icon">✦</div>
      <h3 className="bc-empty-title">Blog Insights Coming Soon</h3>
      <p className="bc-empty-sub">Stay updated with expert {examName} content</p>
      <ul className="bc-empty-list">
        <li>Exam updates &amp; score insights</li>
        <li>Preparation strategies &amp; tips</li>
        <li>Official announcement summaries</li>
        <li>Application &amp; registration guidance</li>
        <li>Study schedules &amp; resources</li>
      </ul>
    </div>
  );

  const blog = blogs[current];

  return (
    <div
      className="bc-wrap"
      onMouseEnter={pauseAll}
      onMouseLeave={resumeAll}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Card ── */}
      <div className={`bc-card bc-dir-${direction} ${transitioning ? "bc-out" : "bc-in"}`}>

        {/* Thumbnail */}
        {blog.featuredImage?.url && (
          <div className="bc-thumb">
            <img
              src={`${API}${blog.featuredImage.url}`}
              alt={blog.title}
              loading="lazy"
              className="bc-thumb-img"
            />
          </div>
        )}

        {/* Meta row */}
        <div className="bc-meta">
          <span className="bc-category">{blog.category}</span>
          <span className="bc-type">{blog.blogType === "PDF" ? "📄 PDF" : "✦ Article"}</span>
          <span className="bc-date">{formatDate(blog.publishedAt || blog.createdAt)}</span>
        </div>

        {/* Title */}
        <h3 className="bc-title">{blog.title}</h3>

        {/* Author */}
        <p className="bc-author">by {fullBlog?.author || blog.author || "Pinnacle Team"}</p>

        {/* Divider */}
        <div className="bc-divider" />

        {/* Auto-scrolling content */}
        <div className="bc-scroll-wrap" ref={scrollEl}>
          {contentLoading ? (
            <div className="bc-content-loading">
              <div className="bc-spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
              <span>Loading article…</span>
            </div>
          ) : (
            <BlogBody content={fullBlog?.content} />
          )}
        </div>

        {/* Fade-out gradient at bottom */}
        <div className="bc-scroll-fade" aria-hidden="true" />
      </div>

      {/* ── Controls ── */}
      {blogs.length > 1 && (
        <div className="bc-controls">
          <button className="bc-nav" onClick={goPrev} aria-label="Previous">←</button>

          <div className="bc-dots">
            {blogs.map((_, i) => (
              <button
                key={i}
                className={`bc-dot ${i === current ? "bc-dot-active" : ""}`}
                onClick={() => goTo(i, i > current ? "next" : "prev")}
                aria-label={`Article ${i + 1}`}
              />
            ))}
          </div>

          <button className="bc-nav" onClick={goNext} aria-label="Next">→</button>
        </div>
      )}
    </div>
  );
}
