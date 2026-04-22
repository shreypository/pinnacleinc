import { useState, useEffect } from "react";

function Admin() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [contacts, setContacts] = useState([]);

  /* =========================
     LOGIN FUNCTION
  ========================= */
  const handleLogin = async () => {
    try {
      const res = await fetch("https://pinnacle-backend-pq2c.onrender.com/api/admin/login", {
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
      } else {
        alert(data.message);
      }
    } catch {
      alert("Server error");
    }
  };

  /* =========================
     FETCH CONTACT DATA
  ========================= */
  const fetchContacts = async () => {
    try {
      const res = await fetch("https://pinnacle-backend-pq2c.onrender.com/api/contact-data");
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchContacts();
    }
  }, [token]);

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  /* =========================
     UI
  ========================= */

  // 🔐 LOGIN SCREEN
  if (!token) {
    return (
      <div style={{ padding: "50px" }}>
        <h1>Admin Login</h1>

        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        /><br /><br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />

        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  // 📊 DASHBOARD
  return (
    <div style={{ padding: "50px" }}>
      <h1>Admin Dashboard</h1>

      <button onClick={handleLogout}>Logout</button>

      <h2>Contact Submissions</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {contacts.map((c, index) => (
            <tr key={index}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.message}</td>
              <td>{new Date(c.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;