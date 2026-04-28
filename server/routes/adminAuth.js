const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

/* ================================
   MULTIPLE ADMINS
================================ */
const ADMINS = [
  { username: "pinnaclepurusharth", password: "P!nn@cLe#2026$X9qL" },
  { username: "pinnaclechethan", password: "S3cur3@Access!789" }
];

/* ================================
   LOGIN
================================ */
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    const user = ADMINS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user: username },
      config.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;