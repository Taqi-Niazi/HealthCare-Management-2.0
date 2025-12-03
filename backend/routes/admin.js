const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");

router.get("/stats", authMiddleware(["admin"]), async (req, res) => {
  try {
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalAppointments = await Appointment.countDocuments();
    const totalPrescriptions = await Prescription.countDocuments();

    res.json({
      stats: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalPrescriptions,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching admin stats" });
  }
});

module.exports = router;
