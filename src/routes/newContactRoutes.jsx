import express from "express";

const router = express.Router();

/* ================================
   SCHEDULE MEETING
================================ */
router.post("/schedule-meeting", (req, res) => {
  try {
    const { name, phone, service, date, time } = req.body;

    if (!name || !phone || !service || !date || !time) {
      return res.status(400).json({ message: "All fields required" });
    }

    console.log("📅 Meeting:", req.body);

    res.status(200).json({ message: "Meeting scheduled successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   PARENT ENQUIRY
================================ */
router.post("/parent-enquiry", (req, res) => {
  try {
    const {
      studentName,
      studentPhone,
      parentName,
      parentPhone,
      services
    } = req.body;

    if (!studentName || !studentPhone || !parentName || !parentPhone) {
      return res.status(400).json({ message: "All fields required" });
    }

    console.log("👨‍👩‍👧 Enquiry:", req.body);

    res.status(200).json({ message: "Enquiry submitted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;