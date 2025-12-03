const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User"); // 👈 Add this to fetch doctor details
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/emailService");

// Create a new appointment (Protected)
// BOOK APPOINTMENT — Only Patient
router.post("/", authMiddleware(["patient"]), async (req, res) => {
  const { doctor, date, reason } = req.body;

  if (!doctor || !date || !reason) {
    return res.status(400).json({ error: "Please fill all fields" });
  }

  try {
    const newAppointment = new Appointment({
      patient: req.user.id,
      doctor,
      date,
      reason,
    });

    await newAppointment.save();

    return res.status(201).json({
      message: "Appointment created successfully",
      appointment: newAppointment,
    });
  } catch (err) {
    console.error("Appointment error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get all appointments for logged-in doctor/patient
router.get("/", authMiddleware(["doctor", "patient"]), async (req, res) => {
  try {
    const filter =
      req.user.role === "doctor"
        ? { doctor: req.user.id }
        : { patient: req.user.id };

    const appointments = await Appointment.find(filter)
      .populate("doctor", "name email")
      .populate("patient", "name email");

    res.json(appointments);
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    res.status(500).json({ error: "Error fetching appointments" });
  }
});

// Update appointment
router.put("/:id", authMiddleware, async (req, res) => {
  const { date, reason } = req.body;

  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date, reason },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Appointment not found" });

    res.json({ message: "Appointment updated successfully", updated });
  } catch (err) {
    console.error("❌ Error updating appointment:", err);
    res.status(500).json({ error: "Error updating appointment" });
  }
});

// Delete appointment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ error: "Appointment not found" });

    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting appointment:", err);
    res.status(500).json({ error: "Error deleting appointment" });
  }
});

module.exports = router;
