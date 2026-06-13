import { useState, useEffect, useRef, useCallback } from "react";
import { API, apiFetch } from "../../services/api";
import "./BlogCarousel.css";

const SCROLL_PPS       = 38;    // auto-scroll speed — pixels/sec (comfortable reading)
const RESUME_AFTER_MS  = 10000; // resume auto-scroll 10s after last manual interaction
const END_PAUSE_MS     = 3000;  // pause 3s at end of article before next
const SHORT_DWELL_MS   = 9000;  // dwell for short articles that don't need scrolling

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

async function fetchByCategory(category) {
  const res = await apiFetch(`${API}/api/blog/category/${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

async function fetchFull(id) {
  const res = await apiFetch(`${API}/api/blog/id/${id}`);
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

  const hovered       = useRef(false);  // mouse over the card → pause auto-scroll
  const userReading   = useRef(false);  // user manually scrolled → pause for 10s
  const atBottom      = useRef(false);  // reached end of current article
  const rafRef        = useRef(null);
  const scrollEl      = useRef(null);
  const lastTimeRef   = useRef(null);
  const resumeTimer   = useRef(null);   // 10s "resume auto-scroll" timer
  const advanceTimer  = useRef(null);   // "go to next article" timer
  const goNextRef     = useRef(() => {});
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

  /* ── Carousel navigation ── */
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

  // Keep a stable ref to goNext so the RAF loop always calls the latest version
  useEffect(() => { goNextRef.current = goNext; }, [goNext]);

  /* ── Auto-scroll loop + end-of-article advance ──
     One RAF loop per displayed article. Increments scrollTop only when
     not hovered and not in user-reading mode. When the bottom is reached,
     it stops and schedules the next article after END_PAUSE_MS. */
  useEffect(() => {
    // Reset per-article state
    atBottom.current = false;
    lastTimeRef.current = null;
    if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null; }
    if (scrollEl.current) scrollEl.current.scrollTop = 0;

    if (!fullBlog) return;

    const scheduleAdvance = (delay) => {
      if (advanceTimer.current || blogs.length <= 1) return;
      advanceTimer.current = setTimeout(() => {
        advanceTimer.current = null;
        goNextRef.current();
      }, delay);
    };

    const tick = (ts) => {
      const el = scrollEl.current;
      if (!el) { rafRef.current = requestAnimationFrame(tick); return; }

      if (lastTimeRef.current == null) lastTimeRef.current = ts;
      const dt = ts - lastTimeRef.current;
      lastTimeRef.current = ts;

      const canScroll = el.scrollHeight > el.clientHeight + 4;
      const reachedBottom = !canScroll || (el.scrollTop + el.clientHeight >= el.scrollHeight - 2);

      if (reachedBottom) {
        if (!atBottom.current) {
          atBottom.current = true;
          // Article fully read → advance. Short (non-scrolling) articles dwell longer.
          scheduleAdvance(canScroll ? END_PAUSE_MS : SHORT_DWELL_MS);
        }
      } else {
        // User scrolled back up → cancel pending advance, keep reading
        if (atBottom.current) {
          atBottom.current = false;
          if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null; }
        }
        // Auto-scroll only when not paused by hover or manual reading
        if (!hovered.current && !userReading.current) {
          el.scrollTop += (SCROLL_PPS * dt) / 1000;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Small delay so the DOM has painted the new content before measuring
    const startId = setTimeout(() => {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    }, 120);

    return () => {
      clearTimeout(startId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null; }
    };
  }, [fullBlog, blogs.length]);

  // Clean up the resume timer on unmount
  useEffect(() => () => { if (resumeTimer.current) clearTimeout(resumeTimer.current); }, []);

  /* ── Manual-scroll detection (wheel + touch) ──
     Marks "user reading", which pauses auto-scroll. Auto-scroll resumes
     RESUME_AFTER_MS after the last manual interaction. */
  const onUserInteract = useCallback(() => {
    userReading.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      userReading.current = false;          // resume auto-scroll from current position
      lastTimeRef.current = null;           // avoid a big dt jump on resume
    }, RESUME_AFTER_MS);
  }, []);

  /* ── Hover pauses auto-scroll (independent of the 10s rule) ── */
  const pauseAll  = () => { hovered.current = true; };
  const resumeAll = () => { hovered.current = false; lastTimeRef.current = null; };

  /* ── Horizontal touch swipe = navigate between articles ── */
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

        {/* Auto-scrolling content — user can also scroll manually */}
        <div
          className="bc-scroll-wrap"
          ref={scrollEl}
          onWheel={onUserInteract}
          onTouchMove={onUserInteract}
        >
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
