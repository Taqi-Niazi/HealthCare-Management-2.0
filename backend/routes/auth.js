// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// =====================================================
// 1️⃣ User / Patient Registration (No hashing here)
// =====================================================
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Please fill all fields" });
  }

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 🔹 Password is Plain. It will be hashed automatically in User model.
    const newUser = new User({
      name,
      email,
      password,
      role: role || "patient",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while registering" });
  }
});


// =====================================================
// 2️⃣ Doctor Registration (Admin only)
// =====================================================
// backend/routes/auth.js
router.post("/register-doctor", authMiddleware, async (req, res) => {
  const { name, email, password, specialization } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const doctor = new User({
      name,
      email,
      password, // plain text here — will be hashed automatically
      role: "doctor",
      specialization,
    });

    await doctor.save(); // 🔥 pre-save hook runs here

    res.status(201).json({ message: "Doctor registered successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Error registering doctor" });
  }
});
// backend/routes/auth.js
router.post("/register-doctor", authMiddleware, async (req, res) => {
  const { name, email, password, specialization } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const doctor = new User({
      name,
      email,
      password, // plain text here — will be hashed automatically
      role: "doctor",
      specialization,
    });

    await doctor.save(); // 🔥 pre-save hook runs here

    res.status(201).json({ message: "Doctor registered successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Error registering doctor" });
  }
});

// =====================================================
// 3️⃣ Login (Check hashed password)
// =====================================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please fill all fields" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // 🔍 Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // 🎟️ Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during login" });
  }
});


// =====================================================
// 4️⃣ Get Logged-in User Info
// =====================================================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

module.exports = router;
