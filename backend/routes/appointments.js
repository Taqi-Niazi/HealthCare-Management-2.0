const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new appointment (Protected)
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
    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: newAppointment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating appointment' });
  }
});

// Get all appointments for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    let filter = {};

    // If the user is a doctor, show their appointments
    if (req.user.role === 'doctor') {
      filter.doctor = req.user.id;
    } 
    // If the user is a patient, show their own appointments
    else if (req.user.role === 'patient') {
      filter.patient = req.user.id;
    }

    const appointments = await Appointment.find(filter);
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// Update an appointment (by ID)
router.put('/:id', authMiddleware, async (req, res) => {
  const { date, reason } = req.body;

  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date, reason },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Appointment not found' });

    res.json({ message: 'Appointment updated successfully', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating appointment' });
  }
});

// Delete an appointment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ error: 'Appointment not found' });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting appointment' });
  }
});

module.exports = router;
