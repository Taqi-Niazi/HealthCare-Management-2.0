// backend/routes/doctor.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const User = require('../models/User');

// GET /api/doctor/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const doctor = await User.findById(req.user.id).select('-password');

    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate('patient', 'name email')  // <-- fixes patient info
      .sort({ date: -1 });

    const prescriptions = await Prescription.find({ doctor: req.user.id })
      .populate('patient', 'name email')
      .sort({ issuedAt: -1 });

    return res.json({
      doctor,
      appointments,
      prescriptions,
      stats: {
        totalPatients: new Set(appointments.map(a => a.patient?._id.toString())).size,
        totalAppointments: appointments.length,
        totalPrescriptions: prescriptions.length
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
