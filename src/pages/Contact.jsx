import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setError(false);

    try {
      await fetch("https://pinnacle-backend-13xo.onrender.com/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      setSuccess(true);

      setForm({
        name: "",
        email: "",
        phone: "",
        message: ""
      });

    } catch (err) {
      setError(true);
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

          {/* WHATSAPP BUTTON */}
          <a
            className="whatsapp-btn"
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hi, I am ${form.name || "a student"}. I am interested in Pinnacle services.`
            )}`}
            target="_blank"
          >
            Chat on WhatsApp
          </a>

          {/* SUCCESS MESSAGE */}
          {success && (
            <p className="success-msg">✅ Message sent successfully!</p>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <p className="error-msg">❌ Something went wrong. Try again.</p>
          )}
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