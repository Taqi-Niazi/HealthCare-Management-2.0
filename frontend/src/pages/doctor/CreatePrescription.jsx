// frontend/src/pages/doctor/CreatePrescription.jsx
import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DoctorSidebar from "../../components/DoctorSidebar";

export default function CreatePrescription() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [medications, setMedications] = useState([{ name: "", dosage: "" }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Fetch doctor's appointments with patients
  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data || []);
    } catch (err) {
      toast.error("Error fetching appointments");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 🔹 Fix: This lets you type in input fields
  const handleMedicationChange = (index, field, value) => {
    const updatedMeds = [...medications];
    updatedMeds[index][field] = value;
    setMedications(updatedMeds);
  };

  // 🔹 Fix: Remove medicine row
  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  // 🔹 Submit Prescription
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment || medications.length === 0) {
      toast.warning("Select an appointment and add at least one medicine.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/prescriptions", {
        appointmentId: selectedAppointment,
        medications,
        notes,
      });

      toast.success("Prescription Created Successfully!");
      navigate("/doctor/prescriptions");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <DoctorSidebar />

      <div className="flex-grow-1 container py-4">
        <div className="card shadow p-4 mx-auto" style={{ maxWidth: "720px" }}>
          <h2 className="text-primary mb-4 text-center">Create Prescription</h2>

          <form onSubmit={handleSubmit}>
            {/* 🔹 Select Appointment */}
            <div className="mb-3">
              <label className="form-label fw-bold">Select Appointment</label>
              <select
                className="form-select"
                value={selectedAppointment}
                onChange={(e) => setSelectedAppointment(e.target.value)}
                required>
                <option value="">-- Choose Appointment --</option>
                {appointments.map((appt) => (
                  <option key={appt._id} value={appt._id}>
                    {appt.patient?.name} —{" "}
                    {new Date(appt.date).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* 🔹 Medications */}
            <div className="mb-2 fw-bold">Medications</div>
            {medications.map((med, index) => (
              <div key={index} className="row g-2 mb-2">
                <div className="col-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Medicine Name"
                    value={med.name}
                    onChange={(e) =>
                      handleMedicationChange(index, "name", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dosage (e.g., 1 tablet/day)"
                    value={med.dosage}
                    onChange={(e) =>
                      handleMedicationChange(index, "dosage", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-2 d-flex">
                  {index > 0 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm w-100"
                      onClick={() => removeMedication(index)}>
                      X
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* 🔹 Add Medicine */}
            <button
              type="button"
              className="btn btn-outline-primary btn-sm mb-3"
              onClick={() =>
                setMedications([...medications, { name: "", dosage: "" }])
              }>
              + Add Medicine
            </button>

            {/* 🔹 Notes */}
            <textarea
              className="form-control mb-3"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional Doctor Notes"
            />

            {/* 🔹 Submit */}
            <div className="text-center">
              <button className="btn btn-success px-4" disabled={loading}>
                {loading ? "Creating..." : "Create Prescription"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
