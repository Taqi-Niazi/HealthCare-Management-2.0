// frontend/src/pages/doctor/PrescriptionView.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";

export default function PrescriptionView() {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await api.get(`/prescriptions/${id}`);
        setPrescription(res.data.prescription || res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load prescription");
        toast.error("Error loading prescription data.");
      }
    };
    fetchPrescription();
  }, [id]);

  if (error) return <div className="container mt-5 text-danger text-center">{error}</div>;
  if (!prescription) return <div className="container mt-5 text-center">Loading...</div>;

  return (
    <div className="container py-4">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: "800px" }}>
        <h2 className="text-primary mb-3 text-center">Prescription Details</h2>

        {/* Patient & Doctor Info */}
        <div className="row mb-3">
          <div className="col-md-6">
            <p><strong>Patient:</strong> {prescription.patient?.name || "N/A"}</p>
            <p><strong>Doctor:</strong> Dr. {prescription.issuedBy?.name || "N/A"}</p>
          </div>
          <div className="col-md-6 text-md-end text-center">
            <p><strong>Issued On:</strong> {new Date(prescription.issuedAt).toLocaleDateString()}</p>
            <p><strong>Prescription ID:</strong> {prescription._id}</p>
          </div>
        </div>

        <hr />

        {/* Medications */}
        <h5>Medications:</h5>
        <ul className="list-group mb-4">
          {prescription.medications?.map((med, idx) => (
            <li key={idx} className="list-group-item d-flex justify-content-between">
              <span className="fw-bold">{med.name}</span>
              <span>{med.dosage}</span>
            </li>
          ))}
        </ul>

        {/* Notes */}
        {prescription.notes && (
          <div className="alert alert-secondary">
            <strong>Doctor Notes:</strong><br />{prescription.notes}
          </div>
        )}

        {/* QR Code View Button */}
        {prescription.qrCodeImage && (
          <div className="text-center">
            <img
              src={prescription.qrCodeImage}
              alt="QR Code"
              style={{ maxWidth: "160px" }}
              className="border p-2"
            />
            <div>
              <a
                href={`http://localhost:5000/api/prescriptions/view/${prescription._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-success mt-2"
              >
                Open via QR Link
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center mt-4 d-flex flex-wrap justify-content-center gap-2">
          <a
            href={`http://localhost:5000/api/prescriptions/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Download PDF
          </a>
          <button className="btn btn-outline-primary" onClick={() => window.print()}>
            Print Prescription
          </button>
        </div>
      </div>
    </div>
  );
}
