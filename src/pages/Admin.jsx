import { useState, useEffect, useRef } from "react";
import "./Admin.css";
import {
  getAdminStats, getStudents, toggleStudent, deleteStudent,
  sendInvite, getInviteList,
  getHomework, createHomework, updateHomework, deleteHomework, deleteHomeworkFile,
  getBlogs, createBlog, createBlogFromPdf, updateBlog, deleteBlog,
  sendTestEmail, checkEmailHealth,
  getFlightInquiries, updateFlightStatus, deleteFlightInquiry,
  getHotelInquiries, updateHotelStatus, deleteHotelInquiry,
  API
} from "../services/api";

const EXAM_CATEGORIES = ["ACT", "GRE", "GMAT", "IELTS", "TOEFL", "PTE", "SAT", "General"];

const TABS = ["Contacts", "Students", "Homework", "Blog", "Invites", "Flights", "Hotels", "Diagnostics"];

/* ══════════════════════════════════════════════
   ROOT — handles login gate
══════════════════════════════════════════════ */
function Admin() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("Contacts");

  const handleLogin = async () => {
    setLoginError("");
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      } else {
        setLoginError(data.message || "Invalid credentials");
      }
    } catch {
      setLoginError("Could not reach server");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (!token) {
    return (
      <div className="admin-page admin-login-bg">
        <div className="admin-login-card admin-fade-in">
          <h2 className="admin-title-pop" style={{ color: "#1e1e2f", fontSize: 22, fontWeight: 700 }}>
            Admin Login
          </h2>
          {loginError && (
            <div className="admin-form-msg error">{loginError}</div>
          )}
          <input
            placeholder="Username"
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button className="admin-primary-btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container admin-fade-in-up">

        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title-pop">Admin Dashboard</h1>
          <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        {/* Stats */}
        <StatsStrip />

        {/* Tab nav */}
        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`admin-tab-btn ${activeTab === t ? "admin-tab-active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="admin-tab-content">
          {activeTab === "Contacts"  && <ContactsTab />}
          {activeTab === "Students"  && <StudentsTab />}
          {activeTab === "Homework"  && <HomeworkTab />}
          {activeTab === "Blog"      && <BlogTab />}
          {activeTab === "Invites"   && <InvitesTab />}
          {activeTab === "Flights"   && <FlightsTab />}
          {activeTab === "Hotels"    && <HotelsTab />}
          {activeTab === "Diagnostics" && <DiagnosticsTab />}
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STATS STRIP
══════════════════════════════════════════════ */
function StatsStrip() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {});
  }, []);

  const items = stats ? [
    { label: "Students",        value: stats.totalStudents   },
    { label: "Active",          value: stats.activeStudents  },
    { label: "Homework",        value: stats.hwCount         },
    { label: "Published Blogs", value: stats.publishedBlogs  },
    { label: "Pending Invites", value: stats.pendingInvites  },
    { label: "Flight Requests", value: stats.flightRequests  },
    { label: "Hotel Requests",  value: stats.hotelRequests   }
  ] : [];

  return (
    <div className="admin-stats-row">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`admin-stat-card ${i === 0 ? "admin-glow-card" : ""} admin-delay-${i + 1}`}
        >
          <h3>{item.label}</h3>
          <p>{item.value ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   CONTACTS TAB
══════════════════════════════════════════════ */
function ContactsTab() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchContacts = () =>
    fetch(`${API}/api/contact-data`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((r) => r.json())
      .then((d) => setContacts(Array.isArray(d) ? d : []));

  useEffect(() => { fetchContacts(); }, []);

  const getType = (msg = "") => {
    if (msg.includes("Meeting"))       return "meeting";
    if (msg.includes("Parent Enquiry")) return "enquiry";
    return "contact";
  };

  const handleDelete = (id) =>
    fetch(`${API}/api/contact/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(() => fetchContacts());

  const displayed = contacts
    .filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => filter === "all" || getType(c.message) === filter)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      <div className="admin-controls admin-fade-in admin-delay-2">
        <input
          className="admin-search-input"
          placeholder="Search by name…"
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-filter-tabs">
          {["all", "meeting", "enquiry"].map((f) => (
            <button
              key={f}
              className={filter === f ? "admin-filter-active" : ""}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrapper admin-fade-in admin-delay-3">
        {displayed.length === 0 ? (
          <EmptyState msg="No contacts found." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Phone</th><th>Message</th><th>Date</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((c) => (
                <tr key={c._id} className="admin-row-animate">
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.message}
                  </td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="admin-delete-btn" onClick={() => handleDelete(c._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   STUDENTS TAB
══════════════════════════════════════════════ */
function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    getStudents().then(setStudents).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleToggle = (id) => toggleStudent(id).then(() => load());
  const handleDelete = (id) => {
    if (!confirm("Remove this student permanently?")) return;
    deleteStudent(id).then(() => load());
  };

  if (loading) return <Spinner />;

  return (
    <div className="admin-table-wrapper admin-fade-in">
      {students.length === 0 ? (
        <EmptyState msg="No students yet. Use the Invites tab to add students." />
      ) : (
        <table>
          <thead>
            <tr><th>Email</th><th>Name</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="admin-row-animate">
                <td>{s.email}</td>
                <td>{s.name || "—"}</td>
                <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`admin-status-badge ${s.isActive ? "is-active" : "is-inactive"}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="admin-toggle-btn" onClick={() => handleToggle(s._id)}>
                    {s.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button className="admin-delete-btn" onClick={() => handleDelete(s._id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   HOMEWORK TAB
══════════════════════════════════════════════ */
function HomeworkTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category: "General" });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef();

  const load = () =>
    getHomework(true).then(setItems).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", category: "General" });
    setFiles([]);
    setEditing(null);
    setMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const openEdit = (hw) => {
    setEditing(hw._id);
    setForm({ title: hw.title, description: hw.description || "", category: hw.category || "General" });
    setFiles([]);
    setMsg("");
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setMsg("err:Title is required."); return; }
    setSaving(true); setMsg("");
    const fd = new FormData();
    fd.append("title",       form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("category",    form.category.trim() || "General");
    files.forEach((f) => fd.append("files", f));
    try {
      editing ? await updateHomework(editing, fd) : await createHomework(fd);
      setMsg("ok:Saved successfully!");
      resetForm();
      load();
    } catch (e) {
      setMsg(`err:${e?.message || "Save failed."}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this homework assignment?")) return;
    deleteHomework(id).then(() => load());
  };

  const handleRemoveFile = (hwId, fileName) => {
    if (!confirm("Remove this file?")) return;
    deleteHomeworkFile(hwId, fileName).then(() => load());
  };

  const msgType = msg.startsWith("ok:") ? "success" : "error";
  const msgText = msg.slice(3);

  if (loading) return <Spinner />;

  return (
    <div className="admin-fade-in">
      <div className="admin-card" style={{ marginBottom: 24, padding: 24 }}>
        <h3 style={{ marginBottom: 16, color: "#2d1457", fontSize: "1rem" }}>
          {editing ? "Edit Assignment" : "New Assignment"}
        </h3>
        {msg && <div className={`admin-form-msg ${msgType}`}>{msgText}</div>}

        <div className="admin-form-row">
          <input
            className="admin-form-input"
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="admin-form-input"
            placeholder="Category (e.g. SAT, IELTS)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>

        <textarea
          className="admin-form-input admin-form-textarea"
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div style={{ marginBottom: 14 }}>
          <label className="admin-file-label">
            Attach files (PDF, DOCX, ZIP, images — max 50 MB each)
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png,.gif,.webp"
              style={{ display: "none" }}
              onChange={(e) => setFiles(Array.from(e.target.files))}
            />
          </label>
          {files.length > 0 && (
            <p style={{ fontSize: "0.82rem", color: "#6c5ce7", marginTop: 6 }}>
              {files.map((f) => f.name).join(", ")}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="admin-primary-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button className="admin-toggle-btn" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState msg="No homework posted yet." />
      ) : (
        <div className="admin-hw-list">
          {items.map((hw) => (
            <div className="admin-hw-item" key={hw._id}>
              <div className="admin-hw-item-header">
                <div>
                  <span className="admin-hw-category-badge">{hw.category}</span>
                  <strong style={{ marginLeft: 10, color: "#2d1457" }}>{hw.title}</strong>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="admin-toggle-btn" onClick={() => openEdit(hw)}>Edit</button>
                  <button className="admin-delete-btn" onClick={() => handleDelete(hw._id)}>Delete</button>
                </div>
              </div>
              {hw.description && (
                <p style={{ fontSize: "0.85rem", color: "#666", marginTop: 6 }}>{hw.description}</p>
              )}
              {hw.files?.length > 0 && (
                <div className="admin-hw-files-list">
                  {hw.files.map((f) => (
                    <span key={f.fileName} className="admin-hw-file-chip">
                      {f.originalName}
                      <button
                        className="admin-chip-del"
                        onClick={() => handleRemoveFile(hw._id, f.fileName)}
                      >×</button>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: 8 }}>
                Added {new Date(hw.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   BLOG TAB — supports TEXT and PDF blogs
══════════════════════════════════════════════ */
function BlogTab() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [blogType, setBlogType] = useState("TEXT"); // "TEXT" | "PDF"
  const [form, setForm] = useState({
    title: "", content: "", category: "General",
    author: "Pinnacle Team", seoDescription: "", isPublished: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile]     = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [view, setView] = useState("list");
  const imageRef = useRef();
  const pdfRef   = useRef();

  const load = () => {
    const t = localStorage.getItem("token");
    fetch(`${API}/api/blog`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json()).then(setBlogs).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setBlogType("TEXT");
    setForm({ title: "", content: "", category: "General", author: "Pinnacle Team", seoDescription: "", isPublished: false });
    setImageFile(null); setPdfFile(null); setEditing(null); setMsg(""); setView("list");
    if (imageRef.current) imageRef.current.value = "";
    if (pdfRef.current)   pdfRef.current.value   = "";
  };

  const openEdit = (b) => {
    setEditing(b._id);
    setBlogType(b.blogType || "TEXT");
    setForm({ title: b.title, content: b.content || "", category: b.category || "General",
      author: b.author || "Pinnacle Team", seoDescription: b.seoDescription || "", isPublished: b.isPublished });
    setImageFile(null); setPdfFile(null); setMsg(""); setView("form");
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setMsg("err:Title is required."); return; }
    if (blogType === "TEXT" && !form.content.trim()) { setMsg("err:Content is required for text blogs."); return; }
    if (blogType === "PDF" && !editing && !pdfFile) { setMsg("err:Please select a PDF file."); return; }

    setSaving(true); setMsg("");

    try {
      if (blogType === "PDF" && !editing) {
        // New PDF blog — upload PDF, backend extracts content
        const fd = new FormData();
        fd.append("pdf", pdfFile);
        fd.append("title",          form.title.trim());
        fd.append("category",       form.category);
        fd.append("author",         form.author.trim() || "Pinnacle Team");
        fd.append("seoDescription", form.seoDescription.trim());
        fd.append("isPublished",    String(form.isPublished));
        await createBlogFromPdf(fd);
      } else {
        // TEXT blog, or editing existing PDF blog (update metadata only)
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
        if (imageFile) fd.append("featuredImage", imageFile);
        editing ? await updateBlog(editing, fd) : await createBlog(fd);
      }
      setMsg("ok:Saved!");
      resetForm();
      load();
    } catch (e) {
      setMsg(`err:${e?.message || "Save failed."}`);
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this blog post?")) return;
    deleteBlog(id).then(() => load());
  };

  const msgType = msg.startsWith("ok:") ? "success" : "error";
  const msgText = msg.slice(3);

  if (loading) return <Spinner />;

  if (view === "form") {
    return (
      <div className="admin-fade-in">
        <div className="admin-card" style={{ padding: 24 }}>
          <h3 style={{ color: "#2d1457", marginBottom: 18, fontSize: "1rem" }}>
            {editing ? "Edit Blog Post" : "New Blog Post"}
          </h3>

          {msg && <div className={`admin-form-msg ${msgType}`}>{msgText}</div>}

          {/* Blog Type — only for new posts */}
          {!editing && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: "0.82rem", color: "#555", marginBottom: 8, fontWeight: 600 }}>Blog Type</p>
              <div style={{ display: "flex", gap: 10 }}>
                {["TEXT", "PDF"].map((t) => (
                  <button
                    key={t}
                    className={blogType === t ? "admin-primary-btn" : "admin-toggle-btn"}
                    style={{ padding: "8px 20px" }}
                    onClick={() => { setBlogType(t); setMsg(""); }}
                    type="button"
                  >
                    {t === "PDF" ? "📄 PDF Upload" : "✦ Text Blog"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Common fields */}
          <div className="admin-form-row">
            <input className="admin-form-input" placeholder="Title *" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select
              className="admin-form-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {EXAM_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-row">
            <input className="admin-form-input" placeholder="Author" value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })} />
            <input className="admin-form-input" placeholder="SEO / preview description" value={form.seoDescription}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
          </div>

          {/* TEXT-only: content + image */}
          {(blogType === "TEXT" || editing) && (
            <>
              <textarea
                className="admin-form-input admin-form-textarea"
                style={{ minHeight: 200 }}
                placeholder="Content *"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              <div style={{ marginBottom: 14 }}>
                <label className="admin-file-label">
                  Featured image (optional — JPG/PNG/WebP, max 10 MB)
                  <input ref={imageRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp"
                    style={{ display: "none" }}
                    onChange={(e) => setImageFile(e.target.files[0] || null)} />
                </label>
                {imageFile && (
                  <p style={{ fontSize: "0.82rem", color: "#6c5ce7", marginTop: 6 }}>{imageFile.name}</p>
                )}
              </div>
            </>
          )}

          {/* PDF-only: PDF upload */}
          {blogType === "PDF" && !editing && (
            <div style={{ marginBottom: 16 }}>
              <label className="admin-file-label" style={{ borderColor: "#6a0dad" }}>
                📄 Upload PDF (max 20 MB — text will be extracted automatically)
                <input
                  ref={pdfRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => setPdfFile(e.target.files[0] || null)}
                />
              </label>
              {pdfFile && (
                <p style={{ fontSize: "0.82rem", color: "#6c5ce7", marginTop: 6 }}>
                  Selected: {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              )}
              <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: 6 }}>
                Note: Text-only PDFs work best. Image-only / scanned PDFs cannot be extracted.
              </p>
            </div>
          )}

          <label className="admin-checkbox-label">
            <input type="checkbox" checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            Publish immediately (appears on exam page carousel)
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="admin-primary-btn" onClick={handleSave} disabled={saving}>
              {saving ? (blogType === "PDF" ? "Extracting PDF…" : "Saving…") : editing ? "Update" : "Create"}
            </button>
            <button className="admin-toggle-btn" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-fade-in">
      {msg && <div className={`admin-form-msg ${msgType}`} style={{ marginBottom: 16 }}>{msgText}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <button className="admin-primary-btn" onClick={() => { setView("form"); setBlogType("TEXT"); setMsg(""); }}>
          + New Post
        </button>
      </div>
      {blogs.length === 0 ? (
        <EmptyState msg="No blog posts yet. Create a Text or PDF blog above." />
      ) : (
        <div className="admin-blog-list">
          {blogs.map((b) => (
            <div className="admin-blog-item" key={b._id}>
              <div className="admin-hw-item-header">
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                  <span className={`admin-status-badge ${b.isPublished ? "is-active" : "is-inactive"}`}>
                    {b.isPublished ? "Published" : "Draft"}
                  </span>
                  <span className="admin-hw-category-badge">
                    {b.blogType === "PDF" ? "📄 PDF" : "✦ Text"}
                  </span>
                  <span className="admin-hw-category-badge" style={{ background: "rgba(106,13,173,0.08)" }}>
                    {b.category}
                  </span>
                  <strong style={{ color: "#2d1457" }}>{b.title}</strong>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button className="admin-toggle-btn" onClick={() => openEdit(b)}>Edit</button>
                  <button className="admin-delete-btn" onClick={() => handleDelete(b._id)}>Delete</button>
                </div>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: 6 }}>
                {b.author} &bull; {new Date(b.createdAt).toLocaleDateString()}
                {b.blogType === "PDF" && b.pdfPageCount ? ` · ${b.pdfPageCount} pages` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   INVITES TAB
══════════════════════════════════════════════ */

const INVITE_STEPS = [
  "Creating secure invite…",
  "Generating one-time token…",
  "Contacting email provider…",
  "Sending invitation email…"
];

function InvitesTab() {
  const [email,   setEmail]   = useState("");
  const [sending, setSending] = useState(false);
  const [step,    setStep]    = useState(0);
  // result shapes: null | { type:"success", sentEmail } | { type:"partial", link } | { type:"error", msg }
  const [result,  setResult]  = useState(null);
  const [copied,  setCopied]  = useState(false);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const stepTimerRef = useRef(null);

  const load = () =>
    getInviteList().then(setInvites).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  // Auto-dismiss success after 5 s
  useEffect(() => {
    if (result?.type === "success") {
      const t = setTimeout(() => setResult(null), 5200);
      return () => clearTimeout(t);
    }
  }, [result]);

  const startStepAnimation = () => {
    let i = 0;
    setStep(0);
    stepTimerRef.current = setInterval(() => {
      i = Math.min(i + 1, INVITE_STEPS.length - 1);
      setStep(i);
    }, 900);
  };

  const stopStepAnimation = () => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
  };

  const handleInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    setResult(null);
    startStepAnimation();

    try {
      const data = await sendInvite(email.trim());
      const sentEmail = email.trim();
      setEmail("");
      load();

      if (data.emailSent) {
        setResult({ type: "success", sentEmail });
      } else {
        setResult({ type: "partial", link: data.inviteLink, sentEmail });
      }
    } catch (e) {
      const msg = e?.message || "Failed to send invitation.";
      const hint = /Admin|token|401|403/i.test(msg)
        ? " Try logging out and back in to refresh your admin session."
        : "";
      setResult({ type: "error", msg: msg + hint });
    } finally {
      stopStepAnimation();
      setSending(false);
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const inviteStatusClass = (inv) => {
    if (inv.isUsed) return "is-used";
    if (new Date(inv.expiresAt) < new Date()) return "is-expired";
    return "is-pending";
  };

  const inviteStatusLabel = (inv) => {
    if (inv.isUsed) return "Used";
    if (new Date(inv.expiresAt) < new Date()) return "Expired";
    return "Pending";
  };

  const emailStatusClass  = (inv) => inv.emailSent === true ? "delivered" : inv.emailSent === false ? "failed" : "pending";
  const emailStatusLabel  = (inv) => inv.emailSent === true ? "Delivered" : inv.emailSent === false ? "Failed" : "—";

  /* ─ Render ─ */
  return (
    <div className="admin-fade-in">
      {/* Send invite card */}
      <div className="admin-card" style={{ marginBottom: 24, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 0" }}>
          <h3 style={{ color: "#2d1457", marginBottom: 14, fontSize: "1rem" }}>Invite a Student</h3>
        </div>

        {/* ── Idle: email input ── */}
        {!sending && !result && (
          <div style={{ padding: "0 24px 20px", display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              className="admin-search-input"
              style={{ flex: 1, minWidth: 240 }}
              type="email"
              placeholder="student@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
            <button className="admin-primary-btn" onClick={handleInvite}>
              Send Invitation
            </button>
          </div>
        )}

        {/* ── Sending: step animation ── */}
        {sending && (
          <div className="invite-loader">
            <div className="invite-loader-spinner" />
            <p className="invite-loader-step">{INVITE_STEPS[step]}</p>
            <p className="invite-loader-sub">Please wait — do not close this window</p>
          </div>
        )}

        {/* ── Success ── */}
        {!sending && result?.type === "success" && (
          <div className="invite-success">
            <div className="invite-success-icon">✓</div>
            <p className="invite-success-title">Invitation Sent Successfully</p>
            <p className="invite-success-email">
              Invitation delivered to <strong>{result.sentEmail}</strong>
            </p>
            <p className="invite-success-sub">
              The student can now create their account using the invitation link.
            </p>
            <div className="invite-success-dismiss" />
            <button
              className="admin-toggle-btn"
              style={{ marginTop: 8 }}
              onClick={() => setResult(null)}
            >
              Send another
            </button>
          </div>
        )}

        {/* ── Email failed but invite created ── */}
        {!sending && result?.type === "partial" && (
          <div style={{ padding: "0 24px 20px", background: "rgba(251,191,36,0.06)", borderTop: "1px solid rgba(251,191,36,0.2)" }}>
            <div className="invite-partial">
              <div className="invite-partial-header">
                <span className="invite-partial-icon">⚠️</span>
                <span className="invite-partial-title">Invitation Created — Email Not Delivered</span>
              </div>
              <p className="invite-partial-body">
                The secure invitation link was created successfully, but the email provider
                could not deliver the message. Share the link below directly with the student.
              </p>
              <div className="invite-copy-row">
                <span className="invite-copy-link">{result.link}</span>
                <button
                  className={`invite-copy-btn ${copied ? "copied" : ""}`}
                  onClick={() => copyLink(result.link)}
                >
                  {copied ? "✓ Copied" : "Copy Link"}
                </button>
              </div>
              <button
                className="admin-toggle-btn"
                style={{ alignSelf: "flex-start", marginTop: 4 }}
                onClick={() => setResult(null)}
              >
                Send another
              </button>
            </div>
          </div>
        )}

        {/* ── Hard error ── */}
        {!sending && result?.type === "error" && (
          <div style={{ padding: "0 24px 20px" }}>
            <div className="admin-form-msg error" style={{ marginBottom: 12 }}>
              {result.msg}
            </div>
            <button className="admin-toggle-btn" onClick={() => setResult(null)}>Try again</button>
          </div>
        )}
      </div>

      {/* Invite history */}
      <div className="admin-table-wrapper">
        <div style={{ padding: "8px 4px 16px", color: "#2d1457", fontWeight: 600, fontSize: "0.95rem" }}>
          Invite History
        </div>
        {loading ? <Spinner /> : invites.length === 0 ? (
          <EmptyState msg="No invites sent yet." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Sent By</th>
                <th>Date</th>
                <th>Invite</th>
                <th>Email</th>
                <th>Delivered At</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => (
                <tr key={inv._id} className="admin-row-animate">
                  <td>{inv.email}</td>
                  <td>{inv.createdBy}</td>
                  <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`admin-status-badge ${inviteStatusClass(inv)}`}>
                      {inviteStatusLabel(inv)}
                    </span>
                  </td>
                  <td>
                    <span className={`email-status-badge ${emailStatusClass(inv)}`}>
                      {emailStatusLabel(inv)}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "#999" }}>
                    {inv.emailSentAt
                      ? new Date(inv.emailSentAt).toLocaleString()
                      : inv.emailError
                        ? <span title={inv.emailError} style={{ color: "#dc2626", cursor: "help" }}>failed ⓘ</span>
                        : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DIAGNOSTICS TAB — Email health + test send
══════════════════════════════════════════════ */
function DiagnosticsTab() {
  const [testing, setTesting]   = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult]     = useState(null); // { ok, message, error, code, hint, transport }

  const runTest = async () => {
    setTesting(true); setResult(null);
    const r = await sendTestEmail();
    setResult({ kind: "test", ...r });
    setTesting(false);
  };

  const runHealth = async () => {
    setChecking(true); setResult(null);
    const r = await checkEmailHealth();
    setResult({ kind: "health", ...r });
    setChecking(false);
  };

  return (
    <div className="admin-fade-in">
      <div className="admin-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: "#2d1457", marginBottom: 8, fontSize: "1rem" }}>Email Diagnostics</h3>
        <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: 18, lineHeight: 1.6 }}>
          Verify the SMTP connection and send a test email to the configured sender address.
          Use this to confirm invite &amp; password-reset emails can be delivered.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="admin-primary-btn" onClick={runTest} disabled={testing || checking}>
            {testing ? "Sending…" : "Send Test Email"}
          </button>
          <button className="admin-toggle-btn" onClick={runHealth} disabled={testing || checking}>
            {checking ? "Checking…" : "Verify Connection"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`admin-form-msg ${result.ok ? "success" : "error"}`}
            style={{ marginTop: 18 }}
          >
            {result.ok ? (
              <>
                <strong>✓ {result.kind === "test" ? "Email delivered" : "SMTP connection OK"}</strong>
                <div style={{ marginTop: 6, fontSize: "0.82rem" }}>
                  {result.kind === "test" && result.message}
                  {result.kind === "health" && `Connected to ${result.host}:${result.port} as ${result.user}`}
                  {result.transport && ` · via ${result.transport}`}
                </div>
              </>
            ) : (
              <>
                <strong>✗ {result.kind === "test" ? "Email failed" : "Connection failed"}</strong>
                <div style={{ marginTop: 6, fontSize: "0.82rem" }}>
                  <div><b>Error:</b> {result.error || "Unknown error"}</div>
                  {result.code && <div><b>Code:</b> {result.code}</div>}
                  {result.hint && <div style={{ marginTop: 4, color: "#92400e" }}><b>Hint:</b> {result.hint}</div>}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="admin-card" style={{ padding: 20 }}>
        <h4 style={{ color: "#2d1457", marginBottom: 10, fontSize: "0.9rem" }}>Common fixes</h4>
        <ul style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.8, paddingLeft: 18 }}>
          <li><b>EAUTH / password:</b> EMAIL_PASS must be a Gmail <b>App Password</b> (2FA required), not the account password.</li>
          <li><b>ENETUNREACH / ETIMEDOUT:</b> the host may block outbound SMTP. IPv4 is already forced; a 587 fallback is attempted automatically.</li>
          <li><b>ENOCREDS:</b> set EMAIL_USER and EMAIL_PASS in the Render dashboard.</li>
        </ul>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   FLIGHTS TAB — flight assistance leads
══════════════════════════════════════════════ */
const FLIGHT_FILTERS = ["All", "New", "Contacted", "Completed"];

function FlightsTab() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    getFlightInquiries()
      .then((d) => setInquiries(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      const updated = await updateFlightStatus(id, status);
      setInquiries((list) => list.map((q) => (q._id === id ? updated : q)));
    } catch { /* ignore — UI stays as-is */ }
    finally { setBusyId(null); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this flight request permanently?")) return;
    setBusyId(id);
    try {
      await deleteFlightInquiry(id);
      setInquiries((list) => list.filter((q) => q._id !== id));
    } catch { /* ignore */ }
    finally { setBusyId(null); }
  };

  const statusClass = (s) =>
    s === "Completed" ? "is-completed" : s === "Contacted" ? "is-contacted" : "is-new";

  const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString() : "—");

  const displayed = filter === "All" ? inquiries : inquiries.filter((q) => q.status === filter);

  /* ── Skeleton loader ── */
  if (loading) {
    return (
      <div className="admin-fade-in">
        <div className="admin-skeleton-list">
          {[...Array(5)].map((_, i) => (
            <div className="admin-skeleton-row" key={i}>
              <span className="admin-skeleton-bar" style={{ width: "18%" }} />
              <span className="admin-skeleton-bar" style={{ width: "24%" }} />
              <span className="admin-skeleton-bar" style={{ width: "14%" }} />
              <span className="admin-skeleton-bar" style={{ width: "20%" }} />
              <span className="admin-skeleton-bar" style={{ width: "12%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-fade-in">
      {/* Filter tabs */}
      <div className="admin-controls admin-delay-1" style={{ marginBottom: 18 }}>
        <div className="admin-filter-tabs">
          {FLIGHT_FILTERS.map((f) => (
            <button
              key={f}
              className={filter === f ? "admin-filter-active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
              {f !== "All" && (
                <span className="admin-filter-count">
                  {inquiries.filter((q) => q.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrapper admin-fade-in admin-delay-2">
        {displayed.length === 0 ? (
          <EmptyState msg={
            filter === "All"
              ? "No flight inquiries yet."
              : `No ${filter.toLowerCase()} flight requests.`
          } />
        ) : (
          <table className="admin-flights-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th>
                <th>From</th><th>To</th><th>Trip</th>
                <th>Departure</th><th>Return</th>
                <th>Pax</th><th>Class</th>
                <th>Status</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((q) => (
                <tr key={q._id} className="admin-row-animate">
                  <td>{q.name}</td>
                  <td>{q.email}</td>
                  <td>{q.phone}</td>
                  <td>
                    <strong>{q.fromAirportCode}</strong>
                    <span className="admin-flight-city">{q.fromCity}</span>
                  </td>
                  <td>
                    <strong>{q.toAirportCode}</strong>
                    <span className="admin-flight-city">{q.toCity}</span>
                  </td>
                  <td>{q.tripType}</td>
                  <td>{fmtDate(q.departureDate)}</td>
                  <td>{q.returnDate ? fmtDate(q.returnDate) : "—"}</td>
                  <td>{q.travellers}</td>
                  <td>{q.cabinClass}</td>
                  <td>
                    <span className={`flight-status-badge ${statusClass(q.status)}`}>
                      {q.status}
                    </span>
                  </td>
                  <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-flight-actions">
                      {q.status !== "Contacted" && (
                        <button
                          className="admin-toggle-btn"
                          disabled={busyId === q._id}
                          onClick={() => setStatus(q._id, "Contacted")}
                        >
                          Mark Contacted
                        </button>
                      )}
                      {q.status !== "Completed" && (
                        <button
                          className="admin-complete-btn"
                          disabled={busyId === q._id}
                          onClick={() => setStatus(q._id, "Completed")}
                        >
                          Mark Completed
                        </button>
                      )}
                      <button
                        className="admin-delete-btn"
                        disabled={busyId === q._id}
                        onClick={() => remove(q._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HOTELS TAB — hotel assistance leads
══════════════════════════════════════════════ */
const HOTEL_FILTERS = ["All", "New", "Contacted", "Completed"];

function HotelsTab() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    getHotelInquiries()
      .then((d) => setInquiries(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      const updated = await updateHotelStatus(id, status);
      setInquiries((list) => list.map((q) => (q._id === id ? updated : q)));
    } catch { /* ignore */ }
    finally { setBusyId(null); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this hotel request permanently?")) return;
    setBusyId(id);
    try {
      await deleteHotelInquiry(id);
      setInquiries((list) => list.filter((q) => q._id !== id));
    } catch { /* ignore */ }
    finally { setBusyId(null); }
  };

  const statusClass = (s) =>
    s === "Completed" ? "is-completed" : s === "Contacted" ? "is-contacted" : "is-new";

  const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString() : "—");

  const displayed = filter === "All" ? inquiries : inquiries.filter((q) => q.status === filter);

  if (loading) {
    return (
      <div className="admin-fade-in">
        <div className="admin-skeleton-list">
          {[...Array(5)].map((_, i) => (
            <div className="admin-skeleton-row" key={i}>
              <span className="admin-skeleton-bar" style={{ width: "18%" }} />
              <span className="admin-skeleton-bar" style={{ width: "24%" }} />
              <span className="admin-skeleton-bar" style={{ width: "16%" }} />
              <span className="admin-skeleton-bar" style={{ width: "18%" }} />
              <span className="admin-skeleton-bar" style={{ width: "12%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-fade-in">
      <div className="admin-controls admin-delay-1" style={{ marginBottom: 18 }}>
        <div className="admin-filter-tabs">
          {HOTEL_FILTERS.map((f) => (
            <button
              key={f}
              className={filter === f ? "admin-filter-active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
              {f !== "All" && (
                <span className="admin-filter-count">
                  {inquiries.filter((q) => q.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrapper admin-fade-in admin-delay-2">
        {displayed.length === 0 ? (
          <EmptyState msg={
            filter === "All"
              ? "No hotel inquiries yet."
              : `No ${filter.toLowerCase()} hotel requests.`
          } />
        ) : (
          <table className="admin-flights-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th>
                <th>Location</th><th>Check-In</th><th>Check-Out</th>
                <th>Rooms</th><th>Guests</th><th>Type</th><th>Budget</th>
                <th>Status</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((q) => (
                <tr key={q._id} className="admin-row-animate">
                  <td>{q.name}</td>
                  <td>{q.email}</td>
                  <td>{q.phone}</td>
                  <td>
                    <strong>{q.location}</strong>
                    {q.locationLabel && q.locationLabel !== q.location && (
                      <span className="admin-flight-city">{q.locationLabel}</span>
                    )}
                  </td>
                  <td>{fmtDate(q.checkIn)}</td>
                  <td>{fmtDate(q.checkOut)}</td>
                  <td>{q.rooms}</td>
                  <td>{q.adults + q.children}</td>
                  <td>{q.propertyType}</td>
                  <td>{q.priceRange}</td>
                  <td>
                    <span className={`flight-status-badge ${statusClass(q.status)}`}>
                      {q.status}
                    </span>
                  </td>
                  <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-flight-actions">
                      {q.status !== "Contacted" && (
                        <button className="admin-toggle-btn" disabled={busyId === q._id}
                          onClick={() => setStatus(q._id, "Contacted")}>Mark Contacted</button>
                      )}
                      {q.status !== "Completed" && (
                        <button className="admin-complete-btn" disabled={busyId === q._id}
                          onClick={() => setStatus(q._id, "Completed")}>Mark Completed</button>
                      )}
                      <button className="admin-delete-btn" disabled={busyId === q._id}
                        onClick={() => remove(q._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Shared micro-components ── */
const Spinner = () => (
  <div style={{ textAlign: "center", padding: 40, color: "#aaa", fontFamily: "Inter, sans-serif" }}>
    Loading…
  </div>
);

const EmptyState = ({ msg }) => (
  <div style={{
    textAlign: "center", padding: "48px 20px",
    color: "#aaa", fontSize: "0.95rem", fontFamily: "Inter, sans-serif"
  }}>
    {msg}
  </div>
);

export default Admin;
