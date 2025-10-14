// backend/controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// create appointment (patient creates for a doctor)
exports.create = async (req, res) => {
  try {
    const { doctor, reason, date } = req.body;
    if (!doctor || !reason || !date) return res.status(400).json({ message: 'Missing fields' });

    const appt = await Appointment.create({
      patient: req.user.id,
      doctor,
      reason,
      date: new Date(date)
    });

    res.status(201).json({ appointment: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// list appointments for current user (patient or doctor)
exports.listForUser = async (req, res) => {
  try {
    const filter = req.user.role === 'doctor' ? { doctor: req.user.id } : { patient: req.user.id };
    const appts = await Appointment.find(filter).populate('doctor','name email').populate('patient','name email').sort({ date: 1 });
    res.json({ appointments: appts });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// update appointment status (doctor or admin)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending','confirmed','completed','cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    // only doctor assigned to appointment or admin can change
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: 'Not found' });

    if (req.user.role !== 'admin' && String(appt.doctor) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appt.status = status;
    await appt.save();
    res.json({ appointment: appt });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
