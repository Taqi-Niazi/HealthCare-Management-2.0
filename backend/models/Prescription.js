const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Doctor who issued it
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String },
        frequency: { type: String },
        instructions: { type: String },
      },
    ],

    notes: { type: String },
    qrCodeImage: { type: String },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
