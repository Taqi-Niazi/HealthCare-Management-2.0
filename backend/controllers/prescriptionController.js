// backend/controllers/prescriptionController.js
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const QRCode = require("qrcode");

exports.create = async (req, res) => {
  try {
    const { appointmentId, medications, notes } = req.body;

    if (!appointmentId || !medications || medications.length === 0) {
      return res
        .status(400)
        .json({ message: "Appointment & medications required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (
      appointment.doctor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const pres = await Prescription.create({
      appointment: appointmentId,
      issuedBy: req.user.id,
      patient: appointment.patient,
      medications,
      notes,
    });

    // Generate QR & save properly
    const qrData = `${process.env.FRONTEND_URL}/prescription/${pres._id}`;
    pres.qrCodeImage = await QRCode.toDataURL(qrData);
    await pres.save();

    res
      .status(201)
      .json({ message: "Prescription Created", prescription: pres });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ message: "Error creating prescription" });
  }
};

// Fetch prescriptions for doctor or patient
exports.getForUser = async (req, res) => {
  try {
    const filter =
      req.user.role === "doctor"
        ? { issuedBy: req.user.id }
        : { patient: req.user.id };

    const list = await Prescription.find(filter)
      .populate("issuedBy", "name email")
      .populate("patient", "name email")
      .populate("appointment")
      .sort({ issuedAt: -1 }); // 🔹 Recent first

    res.json({ prescriptions: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching prescriptions" });
  }
};
