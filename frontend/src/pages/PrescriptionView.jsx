import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosInstance";

export default function PrescriptionView() {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrescription = async () => {
    try {
      const res = await api.get(`/prescriptions/${id}`);
      setPrescription(res.data.prescription || res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load prescription");
    }
  };

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  if (error)
    return <div className="container mt-5 text-danger text-center">{error}</div>;

  if (!prescription)
    return <div className="container mt-5 text-center">Loading...</div>;

  return (
    <div className="container py-4">
      <div className="card shadow p-4">
        <h2 className="text-primary mb-4 text-center">Prescription Details</h2>

        <div className="row mb-3">
          <div className="col-md-6">
            <p><strong>Patient:</strong> {prescription.patient?.name || "N/A"}</p>
            <p><strong>Doctor:</strong> Dr. {prescription.doctor?.name || "N/A"}</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p><strong>Issued On:</strong> {new Date(prescription.issuedAt).toLocaleDateString()}</p>
            <p><strong>Prescription ID:</strong> {prescription._id}</p>
          </div>
        </div>

        <hr />

        <h5 className="mt-4">Medications:</h5>
        <ul className="list-group mb-4">
          {prescription.medications?.map((med, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between">
              <span><strong>{med.name}</strong></span>
              <span>{med.dosage}</span>
            </li>
          ))}
        </ul>

        {prescription.notes && (
          <div className="alert alert-secondary">
            <strong>Doctor Notes:</strong> {prescription.notes}
          </div>
        )}

        {prescription.qrCode && (
          <div className="text-center my-4">
            <img
              src={prescription.qrCode}
              alt="Prescription QR"
              width="150"
              height="150"
              className="border p-2"
            />
            <p className="mt-2">Scan to access this prescription</p>
          </div>
        )}

        <div className="text-center mt-3">
          <a
            href={`/api/prescriptions/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary me-2"
          >
            Download PDF
          </a>
          <button
            className="btn btn-outline-primary"
            onClick={() => window.print()}
          >
            Print Prescription
          </button>
        </div>
      </div>
    </div>
  );
}