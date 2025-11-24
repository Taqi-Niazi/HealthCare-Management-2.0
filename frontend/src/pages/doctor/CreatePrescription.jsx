import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DoctorSidebar from "../../components/DoctorSidebar";

export default function CreatePrescription() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [medications, setMedications] = useState([{ name: "", dosage: "" }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch patients assigned to doctor
  const fetchPatients = async () => {
    try {
      const res = await api.get("/doctor/patients");
      setPatients(res.data.patients || res.data || []);
    } catch (err) {
      toast.error("Error fetching patients");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle Medication Inputs
  const handleMedicationChange = (index, field, value) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "" }]);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient || medications.length === 0) {
      toast.warning("Please select a patient and add at least one medication.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/prescriptions", {
        patient: selectedPatient,
        doctor: "self",
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
      {/* Sidebar */}
      <DoctorSidebar />

      {/* Main Content */}
      <div className="flex-grow-1 ms-md-5 ps-md-4 container py-4">
        <div className="card shadow p-4 mx-auto" style={{ maxWidth: "720px" }}>
          <h2 className="text-primary mb-4 text-center">Create Prescription</h2>

          <form onSubmit={handleSubmit}>
            {/* Select Patient */}
            <div className="mb-3">
              <label className="form-label fw-bold">Select Patient</label>
              <select
                className="form-select"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                required
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Medications Section */}
            <div className="mb-2 fw-bold">Medications</div>
            {medications.map((med, index) => (
              <div key={index} className="row g-2 mb-2">
                <div className="col-12 col-md-5">
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
                <div className="col-12 col-md-5">
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
                <div className="col-12 col-md-2 d-flex">
                  {index > 0 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm w-100"
                      onClick={() => removeMedication(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline-primary btn-sm mb-3"
              onClick={addMedication}
            >
              + Add Another Medicine
            </button>

            {/* Notes */}
            <div className="mb-3">
              <label className="form-label fw-bold">Doctor Notes</label>
              <textarea
                className="form-control"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes or instructions"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                className="btn btn-success px-4"
                disabled={loading}
                type="submit"
              >
                {loading ? "Creating..." : "Create Prescription"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
