// backend/routes/prescriptions.js
const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const authMiddleware = require('../middleware/authMiddleware');
const QRCode = require('qrcode'); // ✅ QR library

// ✅ Create new prescription (doctor only) + Generate QR
router.post('/', authMiddleware, async (req, res) => {
  const { patient, doctor, medications } = req.body;

  if (!patient || !doctor || !medications || !Array.isArray(medications) || medications.length === 0) {
    return res.status(400).json({ error: 'Please provide patient, doctor and medications (non-empty array)' });
  }

  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can create prescriptions' });
    }

    const newPrescription = new Prescription({
      patient,
      doctor,
      medications
    });

    await newPrescription.save();

    // ✅ Generate QR Code (link to this prescription)
    const qrData = `${req.protocol}://${req.get('host')}/api/prescriptions/${newPrescription._id}`;
    const qrCode = await QRCode.toDataURL(qrData);

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: newPrescription,
      qrCode
    });
  } catch (err) {
    console.error('Error creating prescription:', err);
    res.status(500).json({ error: 'Server error while creating prescription' });
  }
});

// ✅ Get all prescriptions for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'doctor') {
      filter.doctor = req.user.id;
    } else if (req.user.role === 'patient') {
      filter.patient = req.user.id;
    }

    const prescriptions = await Prescription.find(filter).sort({ issuedAt: -1 });
    if (!prescriptions || prescriptions.length === 0) {
      return res.status(200).json({ message: 'No prescriptions found', prescriptions: [] });
    }

    res.status(200).json({ prescriptions });
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: 'Server error while fetching prescriptions' });
  }
});

// ✅ Get a specific prescription by ID (for QR scanning)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.status(200).json({ prescription });
  } catch (err) {
    console.error('Error fetching prescription by ID:', err);
    res.status(500).json({ error: 'Server error while fetching prescription' });
  }
});

// ✅ Update prescription (doctor only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Only doctors can update' });
    const { medications } = req.body;
    const updated = await Prescription.findByIdAndUpdate(req.params.id, { medications }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Prescription not found' });
    res.json({ message: 'Prescription updated', prescription: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Delete prescription (doctor only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Only doctors can delete' });
    const deleted = await Prescription.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Prescription not found' });
    res.json({ message: 'Prescription deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Fetch prescriptions for a specific patient (admin or doctor)
router.get('/patient/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'patient' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const prescriptions = await Prescription.find({ patient: req.params.id }).populate('doctor', 'name email');
    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching patient prescriptions:', err);
    res.status(500).json({ error: 'Error fetching prescriptions for patient' });
  }
});

// ✅ Fetch prescriptions for a specific doctor (admin or doctor)
router.get('/doctor/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'patient') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const prescriptions = await Prescription.find({ doctor: req.params.id }).populate('patient', 'name email');
    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching doctor prescriptions:', err);
    res.status(500).json({ error: 'Error fetching prescriptions for doctor' });
  }
});

module.exports = router;
