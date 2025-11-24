import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";

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
      toast.error("Error loading prescription data.");
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
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: "800px" }}>
        <h2 className="text-primary mb-3 text-center">Prescription Details</h2>

        {/* Patient and Doctor Info */}
        <div className="row mb-3">
          <div className="col-12 col-md-6 mb-2">
            <p><strong>Patient:</strong> {prescription.patient?.name || "N/A"}</p>
            <p><strong>Doctor:</strong> Dr. {prescription.doctor?.name || "N/A"}</p>
          </div>
          <div className="col-12 col-md-6 text-md-end text-center">
            <p><strong>Issued On:</strong> {new Date(prescription.issuedAt).toLocaleDateString()}</p>
            <p><strong>Prescription ID:</strong> {prescription._id}</p>
          </div>
        </div>

        <hr />

        {/* Medications List */}
        <h5 className="mt-3">Medications:</h5>
        <ul className="list-group mb-4">
          {prescription.medications?.map((med, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
            >
              <span className="fw-bold">{med.name}</span>
              <span className="text-muted">{med.dosage}</span>
            </li>
          ))}
        </ul>

        {/* Doctor Notes */}
        {prescription.notes && (
          <div className="alert alert-secondary">
            <strong>Doctor Notes:</strong> <br />
            <span>{prescription.notes}</span>
          </div>
        )}

        {/* QR Code */}
        {prescription.qrCode && (
          <div className="text-center my-4">
            <img
              src={prescription.qrCode}
              alt="Prescription QR"
              className="img-fluid border p-2"
              style={{ maxWidth: "160px" }}
            />
            <p className="mt-2">Scan to access this prescription instantly</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center mt-3 d-flex flex-wrap justify-content-center gap-2">
          <a
            href={`/api/prescriptions/${id}/pdf`}
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
