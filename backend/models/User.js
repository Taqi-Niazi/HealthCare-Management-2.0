// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },           // user's full name
  email: { type: String, required: true, unique: true }, // unique email
  password: { type: String, required: true },       // hashed password
  role: { type: String, enum: ['patient','doctor','admin'], default: 'patient' }
}, { timestamps: true });                            // createdAt/updatedAt

module.exports = mongoose.model('User', userSchema); // export model
