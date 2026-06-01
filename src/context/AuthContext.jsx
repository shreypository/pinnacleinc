import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    const raw = localStorage.getItem("studentUser");
    if (token && raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentUser");
      }
    }
    setLoading(false);
  }, []);

  const loginStudent = (token, userData) => {
    localStorage.setItem("studentToken", token);
    localStorage.setItem("studentUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logoutStudent = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginStudent, logoutStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
