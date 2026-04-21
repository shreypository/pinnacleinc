import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Results from "./pages/Results";
import StandardizedTests from "./pages/StandardizedTests";
import IeltsToefl from "./pages/IeltsToefl";
import Services from "./pages/Services";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Sat from "./pages/Sat";
import Act from "./pages/Act";
import Gre from "./pages/Gre";
import Gmat from "./pages/Gmat";

import "./App.css";

function App() {
  return (
    <div className="app">

      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/standardized-tests" element={<StandardizedTests />} />
          <Route path="/ielts-toefl" element={<IeltsToefl />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sat" element={<Sat />} />
<Route path="/act" element={<Act />} />
<Route path="/gre" element={<Gre />} />
<Route path="/gmat" element={<Gmat />} />
        </Routes>
      </main>

    </div>
  );
}

export default App;