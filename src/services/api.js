export const API = "https://pinnacle-backend-pq2c.onrender.com";

const studentToken = () => localStorage.getItem("studentToken");
const adminToken = () => localStorage.getItem("token");

const handle = async (res) => {
  const text = await res.text().catch(() => "");
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON response */ }
  if (!res.ok) {
    // Always surface the message if available, so catch blocks show real errors
    return Promise.reject(
      data?.message ? data : { message: `HTTP ${res.status}: ${data?.message || text.slice(0, 120) || "Request failed"}` }
    );
  }
  return data;
};

/* ─── Student Auth ─── */
export const studentLogin = (email, password) =>
  fetch(`${API}/api/auth/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  }).then(handle);

export const forgotPassword = (email) =>
  fetch(`${API}/api/auth/student/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  }).then(handle);

export const resetPassword = (token, password) =>
  fetch(`${API}/api/auth/student/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password })
  }).then(handle);

/* ─── Invite ─── */
export const verifyInviteToken = (token) =>
  fetch(`${API}/api/invite/verify/${token}`).then(handle);

export const acceptInvite = (token, password, name, phone) =>
  fetch(`${API}/api/invite/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password, name, phone })
  }).then(handle);

export const sendInvite = (email) =>
  fetch(`${API}/api/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken()}`
    },
    body: JSON.stringify({ email })
  }).then(handle);

export const getInviteList = () =>
  fetch(`${API}/api/invite/list`, {
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

/* ─── Email Diagnostics (admin) ─────────────────────────────────
   These return the FULL structured body on both success and failure
   (so the UI can show error code + hint). They never throw. */
const diagFetch = async (path, opts = {}) => {
  try {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${adminToken()}`, ...(opts.headers || {}) }
    });
    const body = await res.json().catch(() => ({}));
    return { httpOk: res.ok, status: res.status, ...body };
  } catch (e) {
    return { httpOk: false, ok: false, error: e.message || "Network error", code: "NETWORK" };
  }
};

export const sendTestEmail   = () => diagFetch("/api/admin/test-email", { method: "POST" });
export const checkEmailHealth = () => diagFetch("/api/admin/email-health");

/* ─── Admin — students ─── */
export const getAdminStats = () =>
  fetch(`${API}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

export const getStudents = () =>
  fetch(`${API}/api/admin/students`, {
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

export const toggleStudent = (id) =>
  fetch(`${API}/api/admin/students/${id}/toggle`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

export const deleteStudent = (id) =>
  fetch(`${API}/api/admin/students/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

/* ─── Homework ─── */
export const getHomework = (asAdmin = false) =>
  fetch(`${API}/api/homework`, {
    headers: { Authorization: `Bearer ${asAdmin ? adminToken() : studentToken()}` }
  }).then(handle);

export const createHomework = (formData) =>
  fetch(`${API}/api/homework`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken()}` },
    body: formData
  }).then(handle);

export const updateHomework = (id, formData) =>
  fetch(`${API}/api/homework/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken()}` },
    body: formData
  }).then(handle);

export const deleteHomework = (id) =>
  fetch(`${API}/api/homework/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

export const deleteHomeworkFile = (hwId, fileName) =>
  fetch(`${API}/api/homework/${hwId}/file/${encodeURIComponent(fileName)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

export const downloadHomeworkFile = (fileName) =>
  `${API}/api/homework/download/${encodeURIComponent(fileName)}`;

/* ─── Blog ─── */
export const getBlogs = () =>
  fetch(`${API}/api/blog`).then(handle);

// Fetch blogs for a specific exam category (used by ExamPage carousel)
export const getBlogsByCategory = (category) =>
  fetch(`${API}/api/blog/category/${encodeURIComponent(category)}`).then(handle);

// Fetch full blog content by MongoDB _id
export const getBlogById = (id) =>
  fetch(`${API}/api/blog/id/${id}`).then(handle);

export const getBlog = (slug) =>
  fetch(`${API}/api/blog/${slug}`).then(handle);

export const createBlog = (formData) =>
  fetch(`${API}/api/blog`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken()}` },
    body: formData
  }).then(handle);

// Upload PDF — backend extracts text and creates blog entry
export const createBlogFromPdf = (formData) =>
  fetch(`${API}/api/blog/pdf`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken()}` },
    body: formData
  }).then(handle);

export const updateBlog = (id, formData) =>
  fetch(`${API}/api/blog/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken()}` },
    body: formData
  }).then(handle);

export const deleteBlog = (id) =>
  fetch(`${API}/api/blog/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);
