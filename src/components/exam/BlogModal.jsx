import { useEffect, useRef } from "react";
import { API } from "../../services/api";
import "./BlogModal.css";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });

/*
  Renders plain text content from both TEXT and PDF blogs.
  Content is never set as innerHTML — no XSS risk.
  Paragraphs are split on double newlines; single newlines become <br />.
*/
function ContentRenderer({ content }) {
  if (!content) return <p style={{ color: "#aaa" }}>No content available.</p>;

  const paragraphs = content.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <div className="bm-content-body">
      {paragraphs.map((para, i) => (
        <p key={i}>
          {para.split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

export default function BlogModal({ blog, onClose }) {
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Close on backdrop click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      className="bm-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={blog.title}
    >
      <div className="bm-panel">

        {/* Header */}
        <div className="bm-header">
          <div className="bm-header-meta">
            <span className={`bm-type-badge ${blog.blogType === "PDF" ? "is-pdf" : "is-text"}`}>
              {blog.blogType === "PDF" ? "📄 PDF" : "✦ Article"}
            </span>
            <span className="bm-category">{blog.category}</span>
            <span className="bm-date">
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
          </div>
          <button className="bm-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Featured image */}
        {blog.featuredImage?.url && (
          <div className="bm-featured-img-wrap">
            <img
              src={`${API}${blog.featuredImage.url}`}
              alt={blog.title}
              className="bm-featured-img"
              loading="lazy"
            />
          </div>
        )}

        {/* Title */}
        <h2 className="bm-title">{blog.title}</h2>

        {/* Author */}
        <p className="bm-author">By <strong>{blog.author || "Pinnacle Team"}</strong></p>

        {/* PDF info */}
        {blog.blogType === "PDF" && blog.pdfPageCount > 0 && (
          <div className="bm-pdf-info">
            <span>📄</span>
            <span>Content extracted from <em>{blog.pdfOriginalName || "PDF document"}</em></span>
            <span className="bm-pdf-pages">· {blog.pdfPageCount} pages</span>
          </div>
        )}

        {/* Body content */}
        <ContentRenderer content={blog.content} />

      </div>
    </div>
  );
}
