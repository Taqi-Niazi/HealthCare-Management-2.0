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
      const sortedPatients = (res.data.patients || res.data || []).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setPatients(sortedPatients);
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
    return <div className="container mt-5 text-center">
      <h5>Loading patient data...</h5>
    </div>;

  if (error)
    return <div className="container mt-5 text-danger text-center">
      <h5>{error}</h5>
    </div>;

  return (
    <div className="d-flex">
      <DoctorSidebar />

      <div className="flex-grow-1 ms-md-5 ps-md-4 container py-4">
        <h2 className="text-primary fw-bold mb-4">Patient List</h2>

        {patients.length === 0 ? (
          <div className="alert alert-info text-center">
            No patients assigned yet.
          </div>
        ) : (
          <div className="table-responsive shadow-sm rounded">
            <table className="table table-bordered table-hover align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Last Appointment</th>
                  <th style={{ minWidth: "200px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td className="fw-semibold">{p.name}</td>
                    <td>{p.email || "N/A"}</td>
                    <td>{p.phone || "N/A"}</td>
                    <td>
                      {p.lastAppointment
                        ? new Date(p.lastAppointment).toLocaleDateString()
                        : <span className="text-muted">No History</span>}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap justify-content-center gap-2">
                        <Link
                          to={`/doctor/prescriptions?patient=${p._id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                        💊 Prescriptions
                        </Link>

                        <Link
                          to={`/doctor/patient/${p._id}`}
                          className="btn btn-sm btn-secondary"
                        >
                          👤 Profile
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
