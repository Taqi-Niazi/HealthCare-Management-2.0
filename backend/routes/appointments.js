const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User"); // 👈 Add this to fetch doctor details
const authMiddleware = require("../middleware/authMiddleware");
const sendEmail = require("../utils/emailService");

// ✅ Create a new appointment (Protected)
router.post("/", authMiddleware, async (req, res) => {
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

    // 👉 Fetch doctor details for email
    const doctorDetail = await User.findById(doctor).select("name email");
    const patientDetail = await User.findById(req.user.id).select("name email");

    // 📧 Send email to patient
    try {
      await sendEmail(
        patientDetail.email,
        "Appointment Confirmation - HCMS2.0",
        `Dear ${patientDetail.name},

Your appointment has been successfully booked.

Doctor: Dr. ${doctorDetail?.name || "N/A"}
Date: ${new Date(date).toLocaleString()}
Reason: ${reason}

Please arrive 10 minutes before your scheduled time.

Best Regards,
HCMS2.0 Team`
      );
      console.log(`📧 Email sent to patient: ${patientDetail.email}`);
    } catch (emailErr) {
      console.error("❌ Failed to send email to patient:", emailErr.message);
    }

    // 📧 Send email to doctor
    try {
      await sendEmail(
        doctorDetail.email,
        "New Appointment Booked - HCMS2.0",
        `Dear Dr. ${doctorDetail.name},

A new appointment has been booked.

Patient: ${patientDetail.name}
Date: ${new Date(date).toLocaleString()}
Reason: ${reason}

Please check your dashboard to view the appointment.

Best Regards,
HCMS2.0 Team`
      );
      console.log(`📧 Email sent to doctor: ${doctorDetail.email}`);
    } catch (emailErr) {
      console.error("❌ Failed to send email to doctor:", emailErr.message);
    }

    res.status(201).json({
      message: "Appointment created successfully and emails sent",
      appointment: newAppointment,
    });
  } catch (err) {
    console.error("❌ Error creating appointment:", err);
    res.status(500).json({ error: "Server error while creating appointment" });
  }
});
// ✅ Get all appointments for logged-in doctor/patient
router.get("/", authMiddleware, async (req, res) => {
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

// ✏️ Update appointment
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

// 🗑️ Delete appointment
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
