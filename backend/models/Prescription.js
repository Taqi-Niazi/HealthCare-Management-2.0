// backend/models/Prescription.js
const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  issuedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // doctor
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicines:   [{ name: String, dose: String, frequency: String }], // simple array
  notes:       { type: String },
  qrCodeData:  { type: String } // later store QR string or link
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
