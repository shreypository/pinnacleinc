import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      alert("Message sent successfully!");
    } catch (err) {
      alert("Error sending message");
    }
  };

  return (
    <section className="contact-page">
      <div className="container">

        <h1>Contact Us</h1>

        <form className="contact-form" onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
          />

          <textarea
            name="message"
            placeholder="Your Message"
            onChange={handleChange}
          />

          <button className="primary-btn">Send Message</button>

        </form>

        {/* WHATSAPP BUTTON */}
        <a
          className="whatsapp-btn"
          href="https://wa.me/91XXXXXXXXXX?text=Hi%20I%20am%20interested%20in%20your%20services"
          target="_blank"
        >
          Chat on WhatsApp
        </a>

      </div>
    </section>
  );
}