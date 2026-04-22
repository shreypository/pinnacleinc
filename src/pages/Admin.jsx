import { useState, useEffect } from "react";
import "./Admin.css";

function Admin() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [animate, setAnimate] = useState(false);

  const API = "https://pinnacle-backend-pq2c.onrender.com";

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setTimeout(() => setAnimate(true), 100);
      } else {
        alert(data.message);
      }
    } catch {
      alert("Server error");
    }
  };

  /* ================= FETCH ================= */
  const fetchContacts = async () => {
    const res = await fetch(`${API}/api/contact-data`);
    const data = await res.json();
    setContacts(data);
  };

  useEffect(() => {
    if (token) {
      fetchContacts();
      setTimeout(() => setAnimate(true), 200);
    }
  }, [token]);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    await fetch(`${API}/api/contact/${id}`, {
      method: "DELETE",
    });
    fetchContacts();
  };

  /* ================= TYPE ================= */
  const getType = (msg) => {
    if (msg.includes("Meeting")) return "meeting";
    if (msg.includes("Parent Enquiry")) return "enquiry";
    return "contact";
  };

  /* ================= FILTER + SORT ================= */
  const filteredData = contacts.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const displayedData = filteredData
    .filter((c) => {
      if (activeTab === "all") return true;
      if (activeTab === "meeting") return getType(c.message) === "meeting";
      if (activeTab === "enquiry") return getType(c.message) === "enquiry";
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  /* ================= STATS ================= */
  const totalCount = contacts.length;

  const meetingCount = contacts.filter(
    (c) => getType(c.message) === "meeting"
  ).length;

  const enquiryCount = contacts.filter(
    (c) => getType(c.message) === "enquiry"
  ).length;

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };
    /* ================= LOGIN UI ================= */
  if (!token) {
    return (
      <div className="admin-page login-bg">
        <div className="login-card fade-in">
          <h2 className="title-pop">Admin Login</h2>

          <input
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="primary-btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    );
  }

  /* ================= DASHBOARD UI ================= */
  return (
    <div className="admin-page">
      <div className={`admin-container ${animate ? "fade-in-up" : ""}`}>

        {/* HEADER */}
        <div className="admin-header">
          <h1 className="title-pop">Admin Dashboard</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* STATS */}
        <div className="stats-container">
          <div className="card glow-card delay-1">
            <h3>Total</h3>
            <p>{totalCount}</p>
          </div>

          <div className="card delay-2">
            <h3>Meetings</h3>
            <p>{meetingCount}</p>
          </div>

          <div className="card delay-3">
            <h3>Enquiries</h3>
            <p>{enquiryCount}</p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="admin-controls fade-in delay-2">
          <input
            className="search-input"
            placeholder="Search by name..."
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="tabs">
            <button className={activeTab==="all" ? "active" : ""} onClick={()=>setActiveTab("all")}>All</button>
            <button className={activeTab==="meeting" ? "active" : ""} onClick={()=>setActiveTab("meeting")}>Meetings</button>
            <button className={activeTab==="enquiry" ? "active" : ""} onClick={()=>setActiveTab("enquiry")}>Enquiries</button>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-wrapper fade-in delay-3">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {displayedData.map((c, index) => (
                <tr key={c._id} className="row-animate">
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.message}</td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(c._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Admin;