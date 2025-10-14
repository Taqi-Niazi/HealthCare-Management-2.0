// backend/controllers/prescriptionController.js
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');

// doctor issues prescription for an appointment
exports.create = async (req, res) => {
  try {
    const { appointmentId, medicines = [], notes } = req.body;
    if (!appointmentId) return res.status(400).json({ message: 'Missing appointmentId' });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (String(appointment.doctor) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to issue for this appointment' });
    }

    const pres = await Prescription.create({
      appointment: appointmentId,
      issuedBy: req.user.id,
      patient: appointment.patient,
      medicines,
      notes
    });

    res.status(201).json({ prescription: pres });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getForUser = async (req, res) => {
  try {
    const filter = req.user.role === 'doctor' ? { issuedBy: req.user.id } : { patient: req.user.id };
    const list = await Prescription.find(filter).populate('issuedBy','name email').populate('patient','name email').populate('appointment');
    res.json({ prescriptions: list });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
