import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";

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
import "./App.css";
import Counselling from "./pages/Counselling";
import Admin from "./pages/Admin";

function App() {
  return (
    <div className="app">

      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/standardized-tests" element={<StandardizedTests />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login />} />
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
        </Routes>
      </main>

    </div>
  );
}

export default App;