import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Results from "./pages/Results";
import SatAp from "./pages/SatAp";
import IeltsToefl from "./pages/IeltsToefl";
import Services from "./pages/Services";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";

import "./App.css";

function App() {
  return (
    <div className="app">

      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/sat-ap" element={<SatAp />} />
          <Route path="/ielts-toefl" element={<IeltsToefl />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

    </div>
  );
}

export default App;