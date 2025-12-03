import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await api.get("/prescriptions");
        setPrescriptions(res.data.prescriptions || []);
      } catch (err) {
        toast.error(
          err.response?.data?.error ||
            "Failed to load prescriptions. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  if (loading)
    return <div className="container mt-5 text-center">Loading...</div>;

  return (
    <div className="container py-4">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: "1100px" }}>
        <h2 className="text-success mb-4 text-center">My Prescriptions</h2>

        {prescriptions.length === 0 ? (
          <p className="text-center text-muted">No prescriptions available.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th>Doctor</th>
                  <th>Date Issued</th>
                  <th>Medications</th>
                  <th>QR</th>
                  <th style={{ minWidth: "200px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p._id}>
                    {/* Doctor Name */}
                    <td>
                      {p.issuedBy?.name ? `Dr. ${p.issuedBy.name}` : "N/A"}
                    </td>

                    {/* Date Issued */}
                    <td>
                      {p.issuedAt
                        ? new Date(p.issuedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>

                    {/* Medications */}
                    <td style={{ whiteSpace: "normal", maxWidth: "240px" }}>
                      {p.medications
                        ?.map((m) => `${m.name} (${m.dosage})`)
                        .join(", ") || "N/A"}
                    </td>

                    {/* QR Preview */}
                    <td>
                      {p.qrCodeImage ? (
                        <img
                          src={p.qrCodeImage}
                          alt="QR Code"
                          className="img-thumbnail"
                          style={{ width: "65px", height: "65px" }}
                        />
                      ) : (
                        <span className="text-muted small">Not Generated</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="d-flex flex-wrap justify-content-center gap-2">
                        <Link
                          to={`/prescription/${p._id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Details
                        </Link>

                        {p.qrCodeImage && (
                          <a
                            href={p.qrCodeImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-success"
                          >
                            QR
                          </a>
                        )}

                        <a
                          href={`http://localhost:5000/api/prescriptions/${p._id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-secondary"
                        >
                          PDF
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
    </div>
  );
}
