// backend/routes/doctor.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const User = require("../models/User");

// GET /api/doctor/me — Doctor Dashboard Data
router.get("/me", authMiddleware(["doctor"]), async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Access denied" });
    }

    const doctor = await User.findById(req.user.id).select("-password");

    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name email")
      .sort({ date: -1 });

    const prescriptions = await Prescription.find({ issuedBy: req.user.id }) // ⬅ FIXED
      .populate("patient", "name email")
      .populate("issuedBy", "name email") // ⬅ FIXED
      .populate("appointment") // Optional but correct
      .sort({ issuedAt: -1 });

    return res.json({
      doctor,
      appointments,
      prescriptions,
      stats: {
        totalPatients: new Set(
          appointments.map((a) => a.patient?._id.toString())
        ).size,
        totalAppointments: appointments.length,
        totalPrescriptions: prescriptions.length,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// FETCH PATIENTS ASSIGNED TO THIS DOCTOR
router.get("/patients", authMiddleware(["doctor"]), async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Access denied" });
    }

    const patients = await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name email phone")
      .populate("issuedBy", "name email")
      .sort({ date: -1 });

    // Extract unique patient list
    const uniquePatients = [
      ...new Map(
        patients.map((p) => [p.patient._id.toString(), p.patient])
      ).values(),
    ];

    return res.json({ patients: uniquePatients });
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// NEW: GET /api/doctor/all — Fetch all doctors (for patient to book appointment)
router.get("/all", authMiddleware(["doctor", "patient"]), async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "_id name email specialization"
    );

    res.json({ doctors });
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ error: "Error fetching doctors" });
  }
});

module.exports = router;
