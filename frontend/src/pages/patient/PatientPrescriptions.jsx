// frontend/src/pages/patient/PatientPrescriptions.jsx

import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get("/prescriptions");
      setPrescriptions(res.data.prescriptions || res.data || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to load your prescriptions. Please try again."
      );
      toast.error("Error fetching prescription data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  if (loading)
    return (
      <div className="container mt-5 text-center">Loading prescriptions...</div>
    );

  if (error)
    return (
      <div className="container mt-5 text-center text-danger">{error}</div>
    );

  return (
    <div className="container py-4">
      <h2 className="text-primary mb-4">My Prescriptions</h2>

      {prescriptions.length === 0 ? (
        <p>You don't have any prescriptions yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>Doctor</th>
                <th>Date Issued</th>
                <th>Medications</th>
                <th style={{ minWidth: "170px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => (
                <tr key={p._id}>
                  <td>{p.doctor?.name ? `Dr. ${p.doctor.name}` : "N/A"}</td>
                  <td>
                    {p.issuedAt
                      ? new Date(p.issuedAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td style={{ whiteSpace: "normal", maxWidth: "240px" }}>
                    {p.medications
                      ?.map((m) => `${m.name} (${m.dosage})`)
                      .join(", ") || "N/A"}
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                      <a
                        href={`/api/prescriptions/${p._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        View Online
                      </a>

                      <a
                        href={`/api/prescriptions/${p._id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-secondary"
                      >
                        Download PDF
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
