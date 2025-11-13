// backend/routes/appointments.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/authMiddleware');
const sendEmail = require('../utils/emailService');

// ✅ Create a new appointment (Protected)
router.post('/', authMiddleware, async (req, res) => {
  const { doctor, date, reason } = req.body;

  if (!doctor || !date || !reason) {
    return res.status(400).json({ error: 'Please fill all fields' });
  }

  try {
    const newAppointment = new Appointment({
      patient: req.user.id,
      doctor,
      date,
      reason
    });

    await newAppointment.save();

    // ✅ Send email confirmation
    try {
      await sendEmail(
        req.user.email,
        'Appointment Confirmation - HCMS2.0',
        `Dear ${req.user.name},

Your appointment has been successfully booked.

Doctor: ${doctor}
Date: ${new Date(date).toLocaleString()}
Reason: ${reason}

Please arrive 10 minutes before your scheduled time.

Best Regards,
HCMS2.0 Team`
      );
      console.log(`✅ Appointment email sent to ${req.user.email}`);
    } catch (emailErr) {
      console.error('❌ Email send failed:', emailErr.message);
    }

    res.status(201).json({
      message: 'Appointment created successfully and email sent',
      appointment: newAppointment
    });
  } catch (err) {
    console.error('❌ Error creating appointment:', err);
    res.status(500).json({ error: 'Server error while creating appointment' });
  }
});

// ✅ Get all appointments for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter =
      req.user.role === 'doctor'
        ? { doctor: req.user.id }
        : { patient: req.user.id };

    const appointments = await Appointment.find(filter);
    res.json(appointments);
  } catch (err) {
    console.error('❌ Error fetching appointments:', err);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// ✅ Update appointment by ID
router.put('/:id', authMiddleware, async (req, res) => {
  const { date, reason } = req.body;

  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date, reason },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: 'Appointment not found' });

    res.json({ message: 'Appointment updated successfully', updated });
  } catch (err) {
    console.error('❌ Error updating appointment:', err);
    res.status(500).json({ error: 'Error updating appointment' });
  }
});

// ✅ Delete appointment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ error: 'Appointment not found' });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting appointment:', err);
    res.status(500).json({ error: 'Error deleting appointment' });
  }
});

module.exports = router;
