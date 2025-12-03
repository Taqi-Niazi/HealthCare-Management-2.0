import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import DoctorLayout from "../../components/DoctorLayout";
import "../../styles/DoctorLayout.css";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
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
        setPrescriptions(res.data.prescriptions || []);
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
      <div className="content-inner text-center">

        {/* Header */}
        <h2 className="dashboard-title">Welcome, Dr. {doctor.name}</h2>
        <p className="text-muted mb-4">
          Here’s your clinic overview, including today's activity and prescriptions.
        </p>

        {/* Stats Cards */}
        <div className="row g-4 justify-content-center">
          <StatCard title="Patients" value={stats.totalPatients} color="#4e73df" />
          <StatCard title="Appointments" value={stats.totalAppointments} color="#1cc88a" />
          <StatCard title="Prescriptions" value={stats.totalPrescriptions} color="#f6c23e" />
        </div>

        {/* Recent Appointments */}
        <h4 className="section-title mt-5">Recent Appointments</h4>

        {appointments.length === 0 ? (
          <p className="empty-msg">No appointments found.</p>
        ) : (
          <div className="card table-card shadow-sm p-3">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((appt) => (
                  <tr key={appt._id}>
                    <td>{appt.patient?.name || "N/A"}</td>
                    <td>{new Date(appt.date).toLocaleString()}</td>
                    <td>{appt.reason}</td>
                    <td>{appt.status || "Scheduled"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Prescriptions */}
        <h4 className="section-title mt-5">Recent Prescriptions</h4>

        {prescriptions.length === 0 ? (
          <p className="empty-msg">No prescriptions found.</p>
        ) : (
          <div className="card table-card shadow-sm p-3">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Patient</th>
                  <th>Medications</th>
                  <th>Date Issued</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.slice(0, 5).map((pres) => (
                  <tr key={pres._id}>
                    <td>{pres.patient?.name || "N/A"}</td>
                    <td>{pres.medications?.map((m) => m.name).join(", ") || "N/A"}</td>
                    <td>{new Date(pres.issuedAt).toLocaleDateString()}</td>
                    <td>
                      <a href={`/prescription/${pres._id}`} className="btn btn-sm btn-outline-primary">
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </DoctorLayout>
  );
}

// 📌 Reusable Stat Card Component (Simple & Clean)
const StatCard = ({ title, value, color }) => (
  <div className="col-10 col-md-3">
    <div className="stat-card shadow-sm p-4 rounded-3 text-center" style={{ borderTop: `4px solid ${color}` }}>
      <h6 className="text-muted">{title}</h6>
      <h2 className="fw-bold">{value}</h2>
    </div>
  </div>
);
