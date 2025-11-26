// backend/routes/prescriptions.js
const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const authMiddleware = require("../middleware/authMiddleware");
const QRCode = require("qrcode");
const sendEmail = require("../utils/emailService");

// ✅ Create new prescription (doctor only) + Generate QR + Send Email
router.post("/", authMiddleware, async (req, res) => {
  const { patient, doctor, medications } = req.body;

  if (
    !patient ||
    !doctor ||
    !medications ||
    !Array.isArray(medications) ||
    medications.length === 0
  ) {
    return res
      .status(400)
      .json({
        error:
          "Please provide patient, doctor and medications (non-empty array)",
      });
  }

  try {
    if (req.user.role !== "doctor") {
      return res
        .status(403)
        .json({ error: "Only doctors can create prescriptions" });
    }

    const newPrescription = new Prescription({
      patient,
      doctor: req.user.id,
      medications,
      issuedAt: new Date(),
    });

    await newPrescription.save();

    // ✅ Generate QR Code link
    const qrData = `${req.protocol}://${req.get("host")}/api/prescriptions/${
      newPrescription._id
    }`;
    const qrCode = await QRCode.toDataURL(qrData);

    // ✅ Email patient (if email available)
    if (req.user.email) {
      const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f7fb; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 25px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #2a9d8f;">New Prescription Created</h2>
        <p>Hello <strong>${req.user.name}</strong>,</p>
        <p>Your doctor, <strong>Dr. ${doctor}</strong>, has created a new prescription for you.</p>

        <h3 style="color: #264653;">Prescription Details:</h3>
        <ul style="list-style: none; padding: 0;">
          ${req.body.medications
            .map(
              (med) => `
            <li style="background: #e9f5f2; margin-bottom: 10px; padding: 10px; border-radius: 6px;">
              <strong>${med.name}</strong> - ${med.dosage}
            </li>
          `
            )
            .join("")}
        </ul>

        <p>You can access your prescription using the link below or scan the QR code attached.</p>
        <p>
          <a href="${qrData}" style="background-color: #2a9d8f; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none;">View Prescription</a>
        </p>

        <div style="text-align: center; margin-top: 20px;">
          <img src="${await QRCode.toDataURL(
            qrData
          )}" alt="QR Code" width="150" height="150" />
        </div>

        <p style="margin-top: 20px; color: #555;">Best Regards,<br><strong>HCMS2 Team</strong></p>
      </div>
    </div>
  `;

      await sendEmail(
        req.user.email,
        "New Prescription Created - HCMS2",
        htmlContent
      );
    }

    res.status(201).json({
      message: "Prescription created successfully",
      prescription: newPrescription,
      qrCode,
    });
  } catch (err) {
    console.error("Error creating prescription:", err);
    res.status(500).json({ error: "Server error while creating prescription" });
  }
});

// ✅ Get all prescriptions for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "doctor") {
      filter.doctor = req.user.id;
    } else if (req.user.role === "patient") {
      filter.patient = req.user.id;
    }

    const prescriptions = await Prescription.find(filter).sort({
      issuedAt: -1,
    });
    if (!prescriptions || prescriptions.length === 0) {
      return res
        .status(200)
        .json({ message: "No prescriptions found", prescriptions: [] });
    }

    res.status(200).json({ prescriptions });
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching prescriptions" });
  }
});

//✅ Get a specific prescription by ID (for QR scanning)
router.get("/:id", async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patient", "name email")
      .populate("doctor", "name email");

    if (!prescription) {
      return res.status(404).send("<h2>Prescription not found</h2>");
    }

    // ✅ Generate QR code again for reference
    const qrData = `${req.protocol}://${req.get("host")}/api/prescriptions/${
      prescription._id
    }`;
    const qrCode = await require("qrcode").toDataURL(qrData);

    // ✅ Render a styled HTML response
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
            <p><strong>Patient:</strong> ${
              prescription.patient?.name || "N/A"
            }</p>
            <p><strong>Doctor:</strong> Dr. ${
              prescription.doctor?.name || "N/A"
            }</p>
            <p><strong>Issued On:</strong> ${new Date(
              prescription.issuedAt
            ).toLocaleDateString()}</p>

            <h3 style="color: #264653;">Medications:</h3>
            <ul>
              ${prescription.medications
                .map(
                  (med) => `
                <li><strong>${med.name}</strong> - ${med.dosage}</li>
              `
                )
                .join("")}
            </ul>

            <div class="qr">
              <img src="${qrCode}" width="150" height="150" alt="Prescription QR" />
              <p>Scan to re-open this prescription</p>
            </div>

            <!-- ✅ PDF download button -->
    <div class="footer">
      <p>HCMS2 - Healthcare Management System 2.0</p>
      <a href="${req.protocol}://${req.get("host")}/api/prescriptions/${
      prescription._id
    }/pdf" 
         style="display:inline-block;margin-top:10px;padding:10px 15px;background:#2a9d8f;color:#fff;border-radius:6px;text-decoration:none;">
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

// ✅ Download prescription as PDF
router.get("/:id/pdf", async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patient", "name email")
      .populate("doctor", "name email");

    if (!prescription) {
      return res.status(404).send("Prescription not found");
    }

    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Prescription - HCMS 2.0", 70, 20);
    doc.setFontSize(12);
    doc.text(`Patient: ${prescription.patient?.name || "N/A"}`, 20, 40);
    doc.text(`Doctor: Dr. ${prescription.doctor?.name || "N/A"}`, 20, 50);
    doc.text(
      `Issued On: ${new Date(prescription.issuedAt).toLocaleDateString()}`,
      20,
      60
    );

    doc.text("Medications:", 20, 80);
    let y = 90;
    prescription.medications.forEach((med, i) => {
      doc.text(`${i + 1}. ${med.name} - ${med.dosage}`, 25, y);
      y += 10;
    });

    // Footer
    doc.text("HCMS 2.0 - Healthcare Management System", 60, y + 20);

    // Send the PDF file
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

// ✅ Update prescription (doctor only) + Send update email
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res
        .status(403)
        .json({ error: "Only doctors can update prescriptions" });

    const { medications } = req.body;
    const updated = await Prescription.findByIdAndUpdate(
      req.params.id,
      { medications },
      { new: true }
    ).populate("patient", "name email");

    if (!updated)
      return res.status(404).json({ error: "Prescription not found" });

    // ✅ Email the patient if email exists
    if (updated.patient && updated.patient.email) {
      const qrData = `${req.protocol}://${req.get('host')}/api/prescriptions/view/${newPrescription._id}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f7fb; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 25px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #2a9d8f;">Your Prescription Was Updated</h2>
            <p>Hello <strong>${updated.patient.name}</strong>,</p>
            <p>Your doctor, <strong>Dr. ${
              req.user.name
            }</strong>, has updated your prescription.</p>

            <h3 style="color: #264653;">Updated Medication List:</h3>
            <ul style="list-style: none; padding: 0;">
              ${updated.medications
                .map(
                  (med) => `
                <li style="background: #e9f5f2; margin-bottom: 10px; padding: 10px; border-radius: 6px;">
                  <strong>${med.name}</strong> - ${med.dosage}
                </li>
              `
                )
                .join("")}
            </ul>

            <p>You can view the updated prescription using the button below or scan the QR code.</p>
            <p>
              <a href="${qrData}" style="background-color: #2a9d8f; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none;">View Updated Prescription</a>
            </p>

            <div style="text-align: center; margin-top: 20px;">
              <img src="${await require("qrcode").toDataURL(
                qrData
              )}" alt="QR Code" width="150" height="150" />
            </div>

            <p style="margin-top: 20px; color: #555;">Best Regards,<br><strong>HCMS2 Team</strong></p>
          </div>
        </div>
      `;

      await sendEmail(
        updated.patient.email,
        "Prescription Updated - HCMS2",
        htmlContent
      );
      console.log("📩 Update email sent to patient");
    }

    res.json({
      message: "Prescription updated successfully",
      prescription: updated,
    });
  } catch (err) {
    console.error("❌ Error updating prescription:", err);
    res.status(500).json({ error: "Server error while updating prescription" });
  }
});

// ✅ Delete prescription (doctor only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ error: "Only doctors can delete" });
    const deleted = await Prescription.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Prescription not found" });
    res.json({ message: "Prescription deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Fetch prescriptions for a specific patient (admin or doctor)
router.get("/patient/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "patient" && req.user.id !== req.params.id) {
      return res.status(403).json({ error: "Access denied" });
    }
    const prescriptions = await Prescription.find({
      patient: req.params.id,
    }).populate("doctor", "name email");
    res.json(prescriptions);
  } catch (err) {
    console.error("Error fetching patient prescriptions:", err);
    res.status(500).json({ error: "Error fetching prescriptions for patient" });
  }
});

// ✅ Fetch prescriptions for a specific doctor (admin or doctor)
router.get("/doctor/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "patient") {
      return res.status(403).json({ error: "Access denied" });
    }
    const prescriptions = await Prescription.find({
      doctor: req.params.id,
    }).populate("patient", "name email");
    res.json(prescriptions);
  } catch (err) {
    console.error("Error fetching doctor prescriptions:", err);
    res.status(500).json({ error: "Error fetching prescriptions for doctor" });
  }
});

// ✅ Public route to display prescription details in browser via QR link
router.get('/view/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).send('<h2>Prescription not found</h2>');
    }

    res.send(`
      <html>
        <head>
          <title>Prescription Details</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px; }
            .container { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
            h2 { color: #333; }
            ul { list-style: none; padding: 0; }
            li { background: #e8e8e8; padding: 10px; margin: 6px 0; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Prescription</h2>
            <p><strong>Doctor:</strong> ${prescription.doctor}</p>
            <p><strong>Patient:</strong> ${prescription.patient}</p>
            <h3>Medications:</h3>
            <ul>
              ${prescription.medications.map(m => `<li>${m.name} - ${m.dosage}</li>`).join('')}
            </ul>
            <p><strong>Issued:</strong> ${new Date(prescription.issuedAt).toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error rendering prescription view:', err);
    res.status(500).send('<h2>Server error while displaying prescription</h2>');
  }
});

module.exports = router;
