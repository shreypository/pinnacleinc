import { useState, useEffect, useRef } from "react";
import "./Admin.css";
import {
  getAdminStats, getStudents, toggleStudent, deleteStudent,
  sendInvite, getInviteList,
  getHomework, createHomework, updateHomework, deleteHomework, deleteHomeworkFile,
  getBlogs, createBlog, updateBlog, deleteBlog,
  API
} from "../services/api";

const TABS = ["Contacts", "Students", "Homework", "Blog", "Invites"];

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
    { label: "Pending Invites", value: stats.pendingInvites  }
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
   BLOG TAB
══════════════════════════════════════════════ */
function BlogTab() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "", content: "", category: "General",
    author: "Pinnacle Team", seoDescription: "", isPublished: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [view, setView] = useState("list");
  const imageRef = useRef();

  const load = () => {
    const t = localStorage.getItem("token");
    fetch(`${API}/api/blog`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json()).then(setBlogs).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: "", content: "", category: "General", author: "Pinnacle Team", seoDescription: "", isPublished: false });
    setImageFile(null); setEditing(null); setMsg(""); setView("list");
    if (imageRef.current) imageRef.current.value = "";
  };

  const openEdit = (b) => {
    setEditing(b._id);
    setForm({ title: b.title, content: b.content || "", category: b.category || "General",
      author: b.author || "Pinnacle Team", seoDescription: b.seoDescription || "", isPublished: b.isPublished });
    setImageFile(null); setMsg(""); setView("form");
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setMsg("err:Title and content are required.");
      return;
    }
    setSaving(true); setMsg("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (imageFile) fd.append("featuredImage", imageFile);
    try {
      editing ? await updateBlog(editing, fd) : await createBlog(fd);
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

          <div className="admin-form-row">
            <input className="admin-form-input" placeholder="Title *" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="admin-form-input" placeholder="Category" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="admin-form-row">
            <input className="admin-form-input" placeholder="Author" value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })} />
            <input className="admin-form-input" placeholder="SEO description" value={form.seoDescription}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
          </div>
          <textarea
            className="admin-form-input admin-form-textarea"
            style={{ minHeight: 200 }}
            placeholder="Content *"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <div style={{ marginBottom: 14 }}>
            <label className="admin-file-label">
              Featured image (optional)
              <input ref={imageRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp"
                style={{ display: "none" }}
                onChange={(e) => setImageFile(e.target.files[0] || null)} />
            </label>
            {imageFile && (
              <p style={{ fontSize: "0.82rem", color: "#6c5ce7", marginTop: 6 }}>{imageFile.name}</p>
            )}
          </div>

          <label className="admin-checkbox-label">
            <input type="checkbox" checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            Publish immediately
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="admin-primary-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
            <button className="admin-toggle-btn" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <button className="admin-primary-btn" onClick={() => setView("form")}>+ New Post</button>
      </div>
      {blogs.length === 0 ? (
        <EmptyState msg="No blog posts yet." />
      ) : (
        <div className="admin-blog-list">
          {blogs.map((b) => (
            <div className="admin-blog-item" key={b._id}>
              <div className="admin-hw-item-header">
                <div>
                  <span className={`admin-status-badge ${b.isPublished ? "is-active" : "is-inactive"}`}>
                    {b.isPublished ? "Published" : "Draft"}
                  </span>
                  <strong style={{ marginLeft: 10, color: "#2d1457" }}>{b.title}</strong>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="admin-toggle-btn" onClick={() => openEdit(b)}>Edit</button>
                  <button className="admin-delete-btn" onClick={() => handleDelete(b._id)}>Delete</button>
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#aaa", marginTop: 6 }}>
                {b.category} &bull; {b.author} &bull; {new Date(b.createdAt).toLocaleDateString()}
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
function InvitesTab() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    getInviteList().then(setInvites).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setSending(true); setResult(null);
    try {
      const data = await sendInvite(email.trim());
      setResult({ ok: true, msg: data.message, link: data.inviteLink });
      setEmail("");
      load();
    } catch (e) {
      const msg = e?.message || "Failed to send invite.";
      // 401/403 most likely means an old JWT token without role:"admin"
      const hint = (msg.includes("Admin") || msg.includes("token") || msg.includes("401") || msg.includes("403"))
        ? " (Hint: log out and log back in to refresh your admin token, then try again.)"
        : "";
      setResult({ ok: false, msg: msg + hint });
    } finally {
      setSending(false);
    }
  };

  const inviteStatus = (inv) => {
    if (inv.isUsed) return "is-used";
    if (new Date(inv.expiresAt) < new Date()) return "is-expired";
    return "is-pending";
  };

  const inviteLabel = (inv) => {
    if (inv.isUsed) return "Used";
    if (new Date(inv.expiresAt) < new Date()) return "Expired";
    return "Pending";
  };

  return (
    <div className="admin-fade-in">
      {/* Send invite form */}
      <div className="admin-card" style={{ marginBottom: 24, padding: 24 }}>
        <h3 style={{ color: "#2d1457", marginBottom: 14, fontSize: "1rem" }}>
          Invite a Student
        </h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="admin-search-input"
            style={{ flex: 1, minWidth: 240 }}
            type="email"
            placeholder="student@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
          />
          <button className="admin-primary-btn" onClick={handleInvite} disabled={sending}>
            {sending ? "Sending…" : "Send Invitation"}
          </button>
        </div>
        {result && (
          <div className={`admin-form-msg ${result.ok ? "success" : "error"}`} style={{ marginTop: 12 }}>
            {result.msg}
            {result.ok && result.link && (
              <div style={{ marginTop: 8, wordBreak: "break-all", fontSize: "0.8rem" }}>
                <strong>Manual link:</strong>{" "}
                <a href={result.link} target="_blank" rel="noreferrer">{result.link}</a>
              </div>
            )}
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
              <tr><th>Email</th><th>Sent By</th><th>Sent</th><th>Expires</th><th>Status</th></tr>
            </thead>
            <tbody>
              {invites.map((inv) => (
                <tr key={inv._id} className="admin-row-animate">
                  <td>{inv.email}</td>
                  <td>{inv.createdBy}</td>
                  <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(inv.expiresAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`admin-status-badge ${inviteStatus(inv)}`}>
                      {inviteLabel(inv)}
                    </span>
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
