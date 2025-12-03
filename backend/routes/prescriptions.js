// backend/routes/prescriptions.js
const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const authMiddleware = require("../middleware/authMiddleware");
const QRCode = require("qrcode");
const sendEmail = require("../utils/emailService");

// CREATE PRESCRIPTION
router.post("/", authMiddleware(["doctor"]), async (req, res) => {
  try {
    const { appointmentId, medications = [], notes } = req.body;

    if (!appointmentId || medications.length === 0) {
      return res.status(400).json({ error: "Appointment ID and medications are required" });
    }

    // 🔹 Fetch appointment to get correct patient
    const appointment = await Appointment.findById(appointmentId).populate("patient", "name email");
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    // 🔹 Create prescription with correct patient
    const newPrescription = new Prescription({
      appointment: appointment._id,
      issuedBy: req.user.id,
      patient: appointment.patient._id, // 👈 Correct patient
      medications,
      notes,
      issuedAt: new Date(),
    });

    // 🔹 Generate QR Code and save it
    const qrData = `${req.protocol}://${req.get("host")}/api/prescriptions/${newPrescription._id}`;
    const qrCode = await QRCode.toDataURL(qrData);
    newPrescription.qrCodeImage = qrCode;

    await newPrescription.save();

    res.status(201).json({
      message: "Prescription created successfully",
      prescription: newPrescription,
    });
  } catch (err) {
    console.error("Error creating prescription:", err);
    res.status(500).json({ error: "Server error while creating prescription" });
  }
});

// GET PRESCRIPTIONS FOR LOGGED-IN USER
router.get("/", authMiddleware(["doctor", "patient"]), async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "doctor") {
      filter.issuedBy = req.user.id;    // ✅ matches schema
    } else if (req.user.role === "patient") {
      filter.patient = req.user.id;
    }

    const prescriptions = await Prescription.find(filter)
      .populate("patient", "name email")
      .populate("issuedBy", "name email")
      .populate("appointment", "date reason")
      .sort({ issuedAt: -1 });

    res.status(200).json({ prescriptions });
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching prescriptions" });
  }
});

// GET SINGLE PRESCRIPTION (used by QR + View)
router.get("/:id", async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patient", "name email")
      .populate("issuedBy", "name email")
      .populate("appointment", "date reason");

    if (!prescription) {
      return res.status(404).send("<h2>Prescription not found</h2>");
    }

    // Generate QR again for HTML page
    const qrData = `${req.protocol}://${req.get("host")}/api/prescriptions/${
      prescription._id
    }`;
    const qrCode = await QRCode.toDataURL(qrData);

    res.send(`
      <html>
        <head>
          <title>Prescription Details</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f4f7fb;
              padding: 30px;
            }
            .container {
              background: #fff;
              border-radius: 10px;
              max-width: 600px;
              margin: auto;
              padding: 25px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            h2 {
              color: #2a9d8f;
              text-align: center;
            }
            ul {
              list-style: none;
              padding: 0;
            }
            li {
              background: #e9f5f2;
              margin-bottom: 10px;
              padding: 10px;
              border-radius: 6px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #555;
            }
            .qr {
              text-align: center;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Prescription Details</h2>
            <p><strong>Patient:</strong> ${prescription.patient?.name || "N/A"}</p>
            <p><strong>Doctor:</strong> Dr. ${prescription.issuedBy?.name || "N/A"}</p>
            <p><strong>Issued On:</strong> ${new Date(
              prescription.issuedAt
            ).toLocaleDateString()}</p>

            <h3 style="color: #264653;">Medications:</h3>
            <ul>
              ${prescription.medications
                .map(
                  (med) => `
                <li><strong>${med.name}</strong> - ${med.dosage || ""} ${
                    med.frequency || ""
                  }</li>
              `
                )
                .join("")}
            </ul>

            <div class="qr">
              <img src="${qrCode}" width="150" height="150" alt="Prescription QR" />
              <p>Scan to re-open this prescription</p>
            </div>

            <div class="footer">
              <p>HCMS2 - Healthcare Management System 2.0</p>
              <a href="${req.protocol}://${req.get(
                "host"
              )}/api/prescriptions/${
      prescription._id
    }/pdf" style="display:inline-block;margin-top:10px;padding:10px 15px;background:#2a9d8f;color:#fff;border-radius:6px;text-decoration:none;">
                Download as PDF
              </a>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Error fetching prescription by ID:", err);
    res.status(500).send("<h2>Server error while fetching prescription</h2>");
  }
});

// 4) DOWNLOAD PRESCRIPTION AS PDF
router.get("/:id/pdf", async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patient", "name email")
      .populate("issuedBy", "name email");

    if (!prescription) {
      return res.status(404).send("Prescription not found");
    }

    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Prescription - HCMS 2.0", 60, 20);
    doc.setFontSize(12);
    doc.text(`Patient: ${prescription.patient?.name || "N/A"}`, 20, 40);
    doc.text(`Doctor: Dr. ${prescription.issuedBy?.name || "N/A"}`, 20, 50);
    doc.text(
      `Issued On: ${new Date(prescription.issuedAt).toLocaleDateString()}`,
      20,
      60
    );

    doc.text("Medications:", 20, 80);
    let y = 90;
    prescription.medications.forEach((med, i) => {
      doc.text(`${i + 1}. ${med.name} - ${med.dosage || ""}`, 25, y);
      y += 10;
    });

    doc.text("HCMS 2.0 - Healthcare Management System", 50, y + 20);

    const pdfBuffer = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=prescription_${prescription._id}.pdf`
    );
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).send("Server error while generating PDF");
  }
});

// 5) DELETE PRESCRIPTION (doctor only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only doctors/admin can delete" });
    }
    const deleted = await Prescription.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Prescription not found" });
    res.json({ message: "Prescription deleted" });
  } catch (err) {
    console.error("Error deleting prescription:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
