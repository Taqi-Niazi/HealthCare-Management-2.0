// backend/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // patient user id
  doctor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // doctor user id
  reason:  { type: String, required: true },    // short reason for visit
  date:    { type: Date, required: true },      // scheduled date/time
  status:  { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  notes:   { type: String }                      // optional notes
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
