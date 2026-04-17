import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("https://pinnacle-backend-13xo.onrender.com/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      alert("✅ Message sent successfully!");

      setForm({
        name: "",
        email: "",
        phone: "",
        message: ""
      });

    } catch (err) {
      alert("❌ Error sending message");
    }

    setLoading(false);
  };

  return (
    <section className="contact-page">
      <div className="container contact-wrapper">

        {/* LEFT SIDE */}
        <div className="contact-info">
          <h1>Contact Us</h1>
          <p>
            Reach out for guidance, enrollment, or any queries.
            We’ll get back to you as soon as possible.
          </p>

          {/* WHATSAPP BUTTON (NO NUMBER FOR NOW) */}
          <a
            className="whatsapp-btn"
            href={`https://wa.me/?text=Hi, I am ${form.name || "a student"}. I am interested in Pinnacle services.`}
            target="_blank"
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* RIGHT SIDE FORM */}
        <form className="contact-form" onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
          />

          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
          />

          <button className="primary-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>

        </form>

      </div>
    </section>
  );
}