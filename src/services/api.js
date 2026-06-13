// API base + wake-aware fetch live in backendStatus (single source of truth).
// apiFetch guarantees the Render instance is awake before every request.
import { API, apiFetch } from "./backendStatus";
export { API, apiFetch };

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
  apiFetch(`${API}/api/auth/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  }).then(handle);

export const forgotPassword = (email) =>
  apiFetch(`${API}/api/auth/student/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  }).then(handle);

export const resetPassword = (token, password) =>
  apiFetch(`${API}/api/auth/student/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password })
  }).then(handle);

/* ─── Invite ─── */
export const verifyInviteToken = (token) =>
  apiFetch(`${API}/api/invite/verify/${token}`).then(handle);

export const acceptInvite = (token, password, name, phone) =>
  apiFetch(`${API}/api/invite/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password, name, phone })
  }).then(handle);

export const sendInvite = (email) =>
  apiFetch(`${API}/api/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken()}`
    },
    body: JSON.stringify({ email })
  }).then(handle);

export const getInviteList = () =>
  apiFetch(`${API}/api/invite/list`, {
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

/* ─── Email Diagnostics (admin) ─────────────────────────────────
   These return the FULL structured body on both success and failure
   (so the UI can show error code + hint). They never throw. */
const diagFetch = async (path, opts = {}) => {
  try {
    const res = await apiFetch(`${API}${path}`, {
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
  apiFetch(`${API}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

export const getStudents = () =>
  apiFetch(`${API}/api/admin/students`, {
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

export const toggleStudent = (id) =>
  apiFetch(`${API}/api/admin/students/${id}/toggle`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

export const deleteStudent = (id) =>
  apiFetch(`${API}/api/admin/students/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

/* ─── Homework ─── */
export const getHomework = (asAdmin = false) =>
  apiFetch(`${API}/api/homework`, {
    headers: { Authorization: `Bearer ${asAdmin ? adminToken() : studentToken()}` }
  }).then(handle);

export const createHomework = (formData) =>
  apiFetch(`${API}/api/homework`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken()}` },
    body: formData
  }).then(handle);

export const updateHomework = (id, formData) =>
  apiFetch(`${API}/api/homework/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken()}` },
    body: formData
  }).then(handle);

export const deleteHomework = (id) =>
  apiFetch(`${API}/api/homework/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

export const deleteHomeworkFile = (hwId, fileName) =>
  apiFetch(`${API}/api/homework/${hwId}/file/${encodeURIComponent(fileName)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

export const downloadHomeworkFile = (fileName) =>
  `${API}/api/homework/download/${encodeURIComponent(fileName)}`;

/* ─── Blog ─── */
export const getBlogs = () =>
  apiFetch(`${API}/api/blog`).then(handle);

// Fetch blogs for a specific exam category (used by ExamPage carousel)
export const getBlogsByCategory = (category) =>
  apiFetch(`${API}/api/blog/category/${encodeURIComponent(category)}`).then(handle);

// Fetch full blog content by MongoDB _id
export const getBlogById = (id) =>
  apiFetch(`${API}/api/blog/id/${id}`).then(handle);

export const getBlog = (slug) =>
  apiFetch(`${API}/api/blog/${slug}`).then(handle);

export const createBlog = (formData) =>
  apiFetch(`${API}/api/blog`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken()}` },
    body: formData
  }).then(handle);

// Upload PDF — backend extracts text and creates blog entry
export const createBlogFromPdf = (formData) =>
  apiFetch(`${API}/api/blog/pdf`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken()}` },
    body: formData
  }).then(handle);

export const updateBlog = (id, formData) =>
  apiFetch(`${API}/api/blog/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken()}` },
    body: formData
  }).then(handle);

export const deleteBlog = (id) =>
  apiFetch(`${API}/api/blog/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

/* ─── Flights (lead generation) ─── */

// Public: submit a flight assistance request
export const createFlightInquiry = (payload) =>
  apiFetch(`${API}/api/flights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(handle);

// Admin: list all flight inquiries
export const getFlightInquiries = () =>
  apiFetch(`${API}/api/flights`, {
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

// Admin: update workflow status (New | Contacted | Completed)
export const updateFlightStatus = (id, status) =>
  apiFetch(`${API}/api/flights/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken()}`
    },
    body: JSON.stringify({ status })
  }).then(handle);

// Admin: delete an inquiry
export const deleteFlightInquiry = (id) =>
  apiFetch(`${API}/api/flights/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

/* ─── Hotels (lead generation) ─── */

export const createHotelInquiry = (payload) =>
  apiFetch(`${API}/api/hotels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(handle);

export const getHotelInquiries = () =>
  apiFetch(`${API}/api/hotels`, {
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

export const updateHotelStatus = (id, status) =>
  apiFetch(`${API}/api/hotels/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken()}`
    },
    body: JSON.stringify({ status })
  }).then(handle);

export const deleteHotelInquiry = (id) =>
  apiFetch(`${API}/api/hotels/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken()}` }
  }).then(handle);

/* ─── Visitor counter (MongoDB-backed) ─── */

// Increment on each page visit/refresh; returns { count }
export const recordVisit = () =>
  apiFetch(`${API}/api/visitors/hit`, { method: "POST" }, { silent: true }).then(handle);
