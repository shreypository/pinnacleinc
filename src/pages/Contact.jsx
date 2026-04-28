import { useState } from "react";
import "./Contact.css";

const API_BASE = "https://pinnacle-backend-pq2c.onrender.com";

export default function Contact() {

  /* ================================
     MEETING FORM
  ================================= */
  const [meetingForm, setMeetingForm] = useState({
    name: "",
    phone: "",
    service: [],
    date: "",
    time: ""
  });

  const [meetLink, setMeetLink] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ================================
     PARENT FORM
  ================================= */
  const [parentForm, setParentForm] = useState({
    studentName: "",
    studentPhone: "",
    parentName: "",
    parentPhone: "",
    services: []
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const servicesList = [
    "SAT/AP",
    "GRE",
    "GMAT",
    "IELTS",
    "TOEFL",
    "PTE",
    "ACT",
    "VISA",
    "COUNSELLING",
    "ADDITIONAL SERVICES"
  ];

  /* ================================
     FETCH SLOTS
  ================================= */
  const fetchSlots = async (selectedDate) => {
    setSlotsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/slots?date=${selectedDate}`
      );
      const data = await res.json();
      setAvailableSlots(data);
    } catch (err) {
      console.error("Error fetching slots", err);
    }
    setSlotsLoading(false);
  };

  /* ================================
     MEETING SUBMIT
  ================================= */
  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    setMeetLink("");

    try {
      const res = await fetch(`${API_BASE}/api/schedule-meeting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(meetingForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Meeting scheduled successfully!");

      if (data.meetLink) {
        setMeetLink(data.meetLink);
      }

      setMeetingForm({
        name: "",
        phone: "",
        service: [],
        date: "",
        time: ""
      });

      setAvailableSlots([]);

    } catch (err) {
      setError(err.message || "Failed to schedule meeting");
    }

    setLoading(false);
  };

  /* ================================
     PARENT SUBMIT
  ================================= */
  const handleParentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/parent-enquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parentForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Details submitted successfully!");

      setParentForm({
        studentName: "",
        studentPhone: "",
        parentName: "",
        parentPhone: "",
        services: []
      });

    } catch (err) {
      setError(err.message || "Submission failed");
    }

    setLoading(false);
  };

  return (
    <section className="contact-page">

      {/* ================= SOCIAL BAR ================= */}
      <div className="social-bar">
        <a href="https://www.instagram.com/_pinnacleinc" target="_blank">Instagram</a>
        <a href="https://www.facebook.com/share/1GqyNJYzrN" target="_blank">Facebook</a>
        <a href="https://youtube.com/@studyabroadwithpinnacle" target="_blank">YouTube</a>
        <a href="https://www.linkedin.com/company/pinnacleincorporated/" target="_blank">LinkedIn</a>
        <a href="https://www.reddit.com/u/PinnacleInc/" target="_blank">Reddit</a>
      </div>

      <div className="container contact-wrapper">
                {/* ================= LEFT — MEETING ================= */}
        <div className="contact-card premium-card">

          <h1 className="section-title">Schedule a Meeting</h1>
          <p className="section-subtitle">
            Select services, date and choose your preferred time slot.
          </p>

          <form className="contact-form" onSubmit={handleMeetingSubmit}>

            {/* NAME */}
            <input
              type="text"
              placeholder="Your Name"
              value={meetingForm.name}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, name: e.target.value })
              }
              required
            />

            {/* PHONE */}
            <input
              type="text"
              placeholder="Phone Number"
              value={meetingForm.phone}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, phone: e.target.value })
              }
              required
            />

            {/* ================= SERVICES ================= */}
            <div className="services-section">
              <p className="label">Select Services</p>

              <div className="services-grid">
                {servicesList.map((service) => (
                  <button
                    key={service}
                    type="button"
                    className={`service-chip ${
                      meetingForm.service.includes(service) ? "active" : ""
                    }`}
                    onClick={() => {
                      const updated = meetingForm.service.includes(service)
                        ? meetingForm.service.filter((s) => s !== service)
                        : [...meetingForm.service, service];

                      setMeetingForm({
                        ...meetingForm,
                        service: updated
                      });
                    }}
                  >
                    {service}
                  </button>
                ))}
              </div>

              {meetingForm.service.length > 0 && (
                <p className="selected-count">
                  {meetingForm.service.length} selected
                </p>
              )}
            </div>

            {/* DATE */}
            <input
              type="date"
              value={meetingForm.date}
              onChange={(e) => {
                setMeetingForm({ ...meetingForm, date: e.target.value });
                fetchSlots(e.target.value);
              }}
              required
            />

            {/* ================= SLOTS ================= */}
            <div className="slots-container">

              {slotsLoading ? (
                <p className="no-slots">Loading slots...</p>
              ) : availableSlots.length === 0 ? (
                <p className="no-slots">No slots available</p>
              ) : (
                availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-btn ${
                      meetingForm.time === slot ? "active" : ""
                    }`}
                    onClick={() =>
                      setMeetingForm({ ...meetingForm, time: slot })
                    }
                  >
                    {slot}
                  </button>
                ))
              )}

            </div>

            {/* SUBMIT */}
            <button className="primary-btn premium-btn" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Meeting"}
            </button>

          </form>
        </div>
                {/* ================= RIGHT — PARENT ================= */}
        <div className="contact-card premium-card">

          <h1 className="section-title">Request a Call Back</h1>
          <p className="section-subtitle">
            Share your details and we will get back to you shortly.
          </p>

          <form className="contact-form" onSubmit={handleParentSubmit}>

            <input
              type="text"
              placeholder="Student Name"
              value={parentForm.studentName}
              onChange={(e) =>
                setParentForm({
                  ...parentForm,
                  studentName: e.target.value
                })
              }
              required
            />

            <input
              type="text"
              placeholder="Student Contact"
              value={parentForm.studentPhone}
              onChange={(e) =>
                setParentForm({
                  ...parentForm,
                  studentPhone: e.target.value
                })
              }
              required
            />

            <input
              type="text"
              placeholder="Parent Name"
              value={parentForm.parentName}
              onChange={(e) =>
                setParentForm({
                  ...parentForm,
                  parentName: e.target.value
                })
              }
              required
            />

            <input
              type="text"
              placeholder="Parent Contact"
              value={parentForm.parentPhone}
              onChange={(e) =>
                setParentForm({
                  ...parentForm,
                  parentPhone: e.target.value
                })
              }
              required
            />

            {/* ================= SERVICES ================= */}
            <div className="services-section">
              <p className="label">Services Interested In</p>

              <div className="services-grid">
                {servicesList.map((service) => (
                  <button
                    key={service}
                    type="button"
                    className={`service-chip ${
                      parentForm.services.includes(service) ? "active" : ""
                    }`}
                    onClick={() => {
                      const updated = parentForm.services.includes(service)
                        ? parentForm.services.filter((s) => s !== service)
                        : [...parentForm.services, service];

                      setParentForm({
                        ...parentForm,
                        services: updated
                      });
                    }}
                  >
                    {service}
                  </button>
                ))}
              </div>

              {parentForm.services.length > 0 && (
                <p className="selected-count">
                  {parentForm.services.length} selected
                </p>
              )}
            </div>

            <button className="primary-btn premium-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Details"}
            </button>

          </form>
        </div>

      </div>

      {/* ================= STATUS ================= */}
      {success && <p className="success-msg">✅ {success}</p>}
      {error && <p className="error-msg">❌ {error}</p>}

      {/* ================= MEET LINK ================= */}
      {meetLink && (
  <div className="meet-link-box premium-link">
    <p>Your meeting is scheduled!</p>

    <div className="meet-actions">
      <a href={meetLink} target="_blank" rel="noopener noreferrer">
        Join Google Meet
      </a>

      {/* COPY ICON */}
      <span
  className="copy-icon"
  onClick={() => {
    navigator.clipboard.writeText(meetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }}
>
  {copied ? "✅" : "📋"}
</span>
    </div>
  </div>
)}

      {/* ================= CONTACT DETAILS ================= */}
      <div className="contact-details">

        <div className="detail-card">
          <h2>Visit Us</h2>
          <p>
            Pinnacle Inc.<br />
            C/o Hustle Space Co work<br />
            No. 483, 484, Nimishamba Square,<br />
            Amrutahalli Main Road,<br />
            Bangalore, KA - 560092
          </p>
          <a href="https://share.google/fq8GUvdouJXcO3ukb" target="_blank">
            View on Map
          </a>
        </div>

        <div className="detail-card">
          <h2>Contact</h2>

          <p>
            📞 <a href="tel:9632976007">9632976007</a><br />
            📞 <a href="tel:9731490933">9731490933</a>
          </p>

          <p>
            ✉ <a href="mailto:purusharth@pinnacleinc.com">
              purusharth@pinnacleinc.com
            </a><br />
            ✉ <a href="mailto:chethan@pinnacleinc.com">
              chethan@pinnacleinc.com
            </a>
          </p>
        </div>

        <div className="detail-card">
          <h2>Founders</h2>

          <p>
            <strong>Purusharth Agarwal</strong><br />
            Academic & Executive Founder
          </p>

          <p>
            <strong>Chethan M</strong><br />
            Business & Strategic Founder
          </p>
        </div>

      </div>

    </section>
  );
}