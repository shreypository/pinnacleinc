const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

/* ================================
   SIMPLE ADMIN
================================ */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === "admin" && password === "1234") {
      const token = jwt.sign(
        { user: username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({ token });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;