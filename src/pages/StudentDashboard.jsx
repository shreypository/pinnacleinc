import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getHomework, downloadHomeworkFile, API } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

const FILE_ICONS = {
  "application/pdf": "📄",
  "application/msword": "📝",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "📝",
  "application/zip": "🗜",
  "application/x-zip-compressed": "🗜",
  "image/jpeg": "🖼",
  "image/png": "🖼",
  "image/gif": "🖼",
  "image/webp": "🖼"
};

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function StudentDashboard() {
  const { user, logoutStudent } = useAuth();
  const navigate = useNavigate();

  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    getHomework(false)
      .then(setHomework)
      .catch(() => setError("Failed to load homework. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(homework.map((h) => h.category).filter(Boolean))];

  const visible =
    activeCategory === "All"
      ? homework
      : homework.filter((h) => h.category === activeCategory);

  const handleLogout = () => {
    logoutStudent();
    navigate("/login", { replace: true });
  };

  const handleDownload = (fileName, token) => {
    const url = `${API}/api/homework/download/${encodeURIComponent(fileName)}`;
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", fileName);
    // Inject token via header not possible from <a> tag; open in new tab with Authorization header is complex.
    // Workaround: use fetch + blob download
    const t = localStorage.getItem("studentToken");
    fetch(url, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      })
      .catch(() => alert("Download failed. Please try again."));
  };

  return (
    <div className="sd-page">

      {/* Header */}
      <header className="sd-header">
        <div className="sd-header-inner">
          <div className="sd-brand">
            <div className="sd-brand-dot" />
            <span>Pinnacle</span>
          </div>

          <div className="sd-header-right">
            <span className="sd-welcome">
              {user?.name ? `Hi, ${user.name}` : user?.email}
            </span>
            <button className="sd-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="sd-main">

        {/* Dashboard greeting */}
        <section className="sd-hero">
          <h1 className="sd-hero-title">Student Dashboard</h1>
          <p className="sd-hero-sub">
            Welcome back. Your study materials are ready below.
          </p>
        </section>

        {/* Homework section */}
        <section className="sd-section">
          <div className="sd-section-header">
            <h2 className="sd-section-title">Homework & Resources</h2>
          </div>

          {/* Category filter */}
          {categories.length > 1 && (
            <div className="sd-categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`sd-cat-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* States */}
          {loading && (
            <div className="sd-state">
              <div className="sd-spinner" />
              <p>Loading your homework…</p>
            </div>
          )}

          {!loading && error && (
            <div className="sd-state sd-state-error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="sd-state">
              <div className="sd-empty-icon">📚</div>
              <p>No homework posted yet. Check back soon!</p>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && visible.length > 0 && (
            <div className="sd-hw-grid">
              {visible.map((hw, i) => (
                <div
                  className="sd-hw-card"
                  key={hw._id}
                  style={{ animationDelay: `${0.05 * i}s` }}
                >
                  <div className="sd-hw-card-top">
                    <span className="sd-hw-category">{hw.category || "General"}</span>
                    <span className="sd-hw-date">{formatDate(hw.createdAt)}</span>
                  </div>

                  <h3 className="sd-hw-title">{hw.title}</h3>

                  {hw.description && (
                    <p className="sd-hw-desc">{hw.description}</p>
                  )}

                  {hw.files?.length > 0 && (
                    <div className="sd-hw-files">
                      {hw.files.map((f) => (
                        <button
                          key={f.fileName}
                          className="sd-file-btn"
                          onClick={() => handleDownload(f.fileName)}
                          title={`Download ${f.originalName}`}
                        >
                          <span className="sd-file-icon">
                            {FILE_ICONS[f.mimeType] || "📎"}
                          </span>
                          <span className="sd-file-name">{f.originalName}</span>
                          {f.size && (
                            <span className="sd-file-size">{formatSize(f.size)}</span>
                          )}
                          <span className="sd-file-dl">↓</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
