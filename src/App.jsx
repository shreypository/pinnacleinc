import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import Results from "./pages/Results";
import StandardizedTests from "./pages/StandardizedTests";
import Services from "./pages/Services";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Sat from "./pages/Sat";
import Act from "./pages/Act";
import Gre from "./pages/Gre";
import Gmat from "./pages/Gmat";
import EnglishProficiency from "./pages/EnglishProficiency";
import Ielts from "./pages/Ielts";
import Toefl from "./pages/Toefl";
import Pte from "./pages/Pte";
import Visa from "./pages/Visa";
import FlightsHotels from "./pages/FlightsHotels";
import Insurance from "./pages/Insurance";
import Counselling from "./pages/Counselling";

// Auth pages
import AcceptInvite from "./pages/AcceptInvite";
import { ForgotPassword, ResetPassword } from "./pages/ForgotPassword";

// Protected pages
import StudentDashboard from "./pages/StudentDashboard";

// Admin
import Admin from "./pages/Admin";

import "./App.css";
import "./styles/animations.css";

function App() {
  return (
    <AuthProvider>
      <div className="app">

        <Navbar />
        <div className="nav-spacer"></div>

        <main className="main-content">
          <Routes>
            {/* ── Admin (self-contained auth) ── */}
            <Route path="/admin" element={<Admin />} />

            {/* ── Public ── */}
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/standardized-tests" element={<StandardizedTests />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/sat" element={<Sat />} />
            <Route path="/act" element={<Act />} />
            <Route path="/gre" element={<Gre />} />
            <Route path="/gmat" element={<Gmat />} />
            <Route path="/english-tests" element={<EnglishProficiency />} />
            <Route path="/ielts" element={<Ielts />} />
            <Route path="/toefl" element={<Toefl />} />
            <Route path="/pte" element={<Pte />} />
            <Route path="/visa" element={<Visa />} />
            <Route path="/flights-hotels" element={<FlightsHotels />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/college" element={<Counselling />} />

            {/* ── Auth ── */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/accept-invite/:token" element={<AcceptInvite />} />

            {/* ── Student (protected) ── */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

      </div>
    </AuthProvider>
  );
}

export default App;
