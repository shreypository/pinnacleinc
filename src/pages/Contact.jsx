import { useState } from "react";
import "./Contact.css";

export default function Contact() {

  /* ================================
     LEFT FORM → MEETING
  ================================= */
  const [meetingForm, setMeetingForm] = useState({
    name: "",
    phone: "",
    service: [],
    date: "",
    time: ""
  });

  /* ================================
     RIGHT FORM → PARENT/STUDENT
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
     HANDLE MEETING SUBMIT
  ================================= */
  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/schedule-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(meetingForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Meeting scheduled successfully!");

      setMeetingForm({
        name: "",
        phone: "",
        service: [],
        date: "",
        time: ""
      });

    } catch (err) {
      setError(err.message || "Failed to schedule meeting");
    }

    setLoading(false);
  };

  /* ================================
     HANDLE PARENT SUBMIT
  ================================= */
  const handleParentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/parent-enquiry", {
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
      <div className="container contact-wrapper">

        {/* LEFT SIDE — MEETING */}
        <div className="contact-info">
          <h1>Schedule a Meeting</h1>
          <p>Select services, date and time. We’ll connect with you.</p>

          <form className="contact-form" onSubmit={handleMeetingSubmit}>

            <input
              type="text"
              placeholder="Your Name"
              value={meetingForm.name}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, name: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={meetingForm.phone}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, phone: e.target.value })
              }
              required
            />

            {/* CHECKBOX SERVICES */}
            <div className="checkbox-group">
              {servicesList.map((service) => (
                <label key={service} className="checkbox-item">
                  <input
                    type="checkbox"
                    value={service}
                    checked={meetingForm.service.includes(service)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...meetingForm.service, service]
                        : meetingForm.service.filter((s) => s !== service);

                      setMeetingForm({ ...meetingForm, service: updated });
                    }}
                  />
                  {service}
                </label>
              ))}
            </div>

            <input
              type="date"
              value={meetingForm.date}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, date: e.target.value })
              }
              required
            />

            <input
              type="time"
              value={meetingForm.time}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, time: e.target.value })
              }
              required
            />

            <button className="primary-btn" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Meeting"}
            </button>

          </form>
        </div>

        {/* RIGHT SIDE — PARENT/STUDENT */}
        <form className="contact-form" onSubmit={handleParentSubmit}>

          <h2>Student & Parent Details</h2>

          <input
            type="text"
            placeholder="Student Name"
            value={parentForm.studentName}
            onChange={(e) =>
              setParentForm({ ...parentForm, studentName: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Student Contact"
            value={parentForm.studentPhone}
            onChange={(e) =>
              setParentForm({ ...parentForm, studentPhone: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Parent Name"
            value={parentForm.parentName}
            onChange={(e) =>
              setParentForm({ ...parentForm, parentName: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Parent Contact"
            value={parentForm.parentPhone}
            onChange={(e) =>
              setParentForm({ ...parentForm, parentPhone: e.target.value })
            }
            required
          />

          {/* CHECKBOX SERVICES */}
          <div className="checkbox-group">
            {servicesList.map((service) => (
              <label key={service} className="checkbox-item">
                <input
                  type="checkbox"
                  value={service}
                  checked={parentForm.services.includes(service)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...parentForm.services, service]
                      : parentForm.services.filter((s) => s !== service);

                    setParentForm({ ...parentForm, services: updated });
                  }}
                />
                {service}
              </label>
            ))}
          </div>

          <button className="primary-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Details"}
          </button>

        </form>

      </div>

      {/* STATUS MESSAGES */}
      {success && <p className="success-msg">✅ {success}</p>}
      {error && <p className="error-msg">❌ {error}</p>}

    </section>
  );
}