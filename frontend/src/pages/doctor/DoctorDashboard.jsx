import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import DoctorLayout from "../../components/DoctorLayout";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]); // <-- Add this
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
  });

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const res = await api.get("/doctor/me");
        setDoctor(res.data.doctor);
        setAppointments(res.data.appointments || []);
        setPrescriptions(res.data.prescriptions || []); // <-- Store prescriptions
        setStats(res.data.stats || {});
      } catch (err) {
        toast.error("Unable to load doctor dashboard.");
      }
    };
    fetchDoctorData();
  }, []);

  if (!doctor) return <div className="text-center mt-5">Loading...</div>;

  return (
    <DoctorLayout>
      <div className="content-inner">
        <div className="dashboard-container">

          <h2 className="dashboard-title">Welcome Dr. {doctor.name}</h2>

          {/* Stats Section */}
          <div className="stats-row">
            <StatCard title="Total Patients" value={stats.totalPatients} />
            <StatCard title="Total Appointments" value={stats.totalAppointments} />
            <StatCard title="Total Prescriptions" value={stats.totalPrescriptions} />
          </div>

          {/* Recent Prescriptions Section */}
          <div className="section-title mt-4">Recent Prescriptions</div>

          {prescriptions.length === 0 ? (
            <div className="empty-msg">No prescriptions found.</div>
          ) : (
            <div className="card table-card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover table-bordered align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Patient</th>
                      <th>Medications</th>
                      <th>Date Issued</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.slice(0, 5).map((pres) => (
                      <tr key={pres._id}>
                        <td>{pres.patient?.name || "N/A"}</td>
                        <td>
                          {pres.medications?.map((m) => m.name).join(", ") ||
                            "N/A"}
                        </td>
                        <td>{new Date(pres.issuedAt).toLocaleDateString()}</td>
                        <td>
                          <a
                            href={`/prescription/${pres._id}`}
                            className="btn btn-sm btn-primary"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}

// 📌 StatCard Component
const StatCard = ({ title, value }) => (
  <div className="stat-card shadow-sm text-center p-4 border-0 rounded-3">
    <h6 className="text-muted mb-1">{title}</h6>
    <h3 className="fw-bold">{value}</h3>
  </div>
);
