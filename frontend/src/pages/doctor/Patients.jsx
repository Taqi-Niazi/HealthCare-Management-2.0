import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { Link } from "react-router-dom";
import DoctorSidebar from "../../components/DoctorSidebar";
import { toast } from "react-toastify";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/doctor/patients");
      setPatients(res.data.patients || res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch patients");
      toast.error("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  if (loading)
    return (
      <div className="container mt-5 text-center">
        <h4>Loading patients...</h4>
      </div>
    );

  if (error)
    return (
      <div className="container mt-5 text-danger text-center">
        <h5>{error}</h5>
      </div>
    );

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <DoctorSidebar />

      {/* Main Content */}
      <div className="flex-grow-1 ms-md-5 ps-md-4 container py-4">
        <h2 className="text-primary mb-4">Patients</h2>

        {patients.length === 0 ? (
          <p>No patients available.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Last Appointment</th>
                  <th style={{ minWidth: "160px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.email || "N/A"}</td>
                    <td>{p.phone || "N/A"}</td>
                    <td>
                      {p.lastAppointment
                        ? new Date(p.lastAppointment).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <Link
                          to={`/doctor/prescriptions?patient=${p._id}`}
                          className="btn btn-sm btn-primary"
                        >
                          💊 Prescriptions
                        </Link>
                        <Link
                          to={`/doctor/patient/${p._id}`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          👤 View Profile
                        </Link>
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
