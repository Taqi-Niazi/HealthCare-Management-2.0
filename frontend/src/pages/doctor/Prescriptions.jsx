import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import DoctorSidebar from "../../components/DoctorSidebar";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get("/prescriptions");
      setPrescriptions(res.data.prescriptions || res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch prescriptions.");
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const deletePrescription = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?"))
      return;

    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions((prev) => prev.filter((p) => p._id !== id));
      toast.success("Prescription deleted.");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Could not delete prescription."
      );
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  if (loading)
    return <div className="container mt-5 text-center">Loading...</div>;
  if (error)
    return (
      <div className="container mt-5 text-center text-danger">{error}</div>
    );

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <DoctorSidebar />

      {/* Main Content */}
      <div className="flex-grow-1 ms-md-5 ps-md-4 container py-4">
        <h2 className="text-primary mb-4 text-center">Prescriptions</h2>

        {prescriptions.length === 0 ? (
          <p>No prescriptions found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th>Patient</th>
                  <th>Medications</th>
                  <th>Date Issued</th>
                  <th>QR</th>
                  <th style={{ minWidth: "190px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p._id}>
                    {/* Patient Name */}
                    <td>{p.patient?.name || "Unknown"}</td>

                    <td style={{ whiteSpace: "normal", maxWidth: "220px" }}>
                      {p.medications
                        ?.map((m) => `${m.name} (${m.dosage})`)
                        .join(", ") || "N/A"}
                    </td>

                    <td>
                      {p.issuedAt
                        ? new Date(p.issuedAt).toLocaleDateString("en-IN")
                        : "N/A"}
                    </td>

                    <td>
                      {p.qrCodeImage ? (
                        <img
                          src={p.qrCodeImage}
                          alt="QR"
                          style={{ maxWidth: "70px" }}
                          className="img-thumbnail"
                        />
                      ) : (
                        "Not Generated"
                      )}
                    </td>

                    <td>
                      <div className="d-flex flex-wrap justify-content-center gap-2">
                        <Link
                          to={`/prescription/${p._id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View
                        </Link>

                        {p.qrCodeImage && (
                          <a
                            href={p.qrCodeImage}
                            download={`prescription_${p._id}_qr.png`} // allows download
                            className="btn btn-sm btn-outline-success"
                          >
                            QR
                          </a>
                        )}

                        <a
                          href={`http://localhost:5000/api/prescriptions/${p._id}/pdf`}
                          // ⚠️ Corrected
                          className="btn btn-sm btn-secondary"
                          target="_blank"
                        >
                          PDF
                        </a>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deletePrescription(p._id)}
                        >
                          Delete
                        </button>
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
