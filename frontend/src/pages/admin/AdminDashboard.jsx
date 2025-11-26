import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import DoctorLayout from "../../components/DoctorLayout";
import "../../styles/AdminLayout.css";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ totalPatients: 0, totalAppointments: 0, totalPrescriptions: 0 });

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const res = await api.get("/doctor/me");
        setDoctor(res.data.doctor);
        setAppointments(res.data.appointments || []);
        setStats(res.data.stats || { totalPatients: 0, totalAppointments: 0, totalPrescriptions: 0 });
      } catch (err) {
        toast.error("Unable to load doctor dashboard.");
      }
    };
    fetchDoctorData();
  }, []);

  if (!doctor) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <DoctorLayout>
      <div className="container text-center py-4" style={{ maxWidth: "900px" }}>
        <h2 className="text-primary mb-4">Welcome Dr. {doctor.name}</h2>

        {/* Stats Cards */}
        <div className="row g-4 mb-5 justify-content-center">
          <StatCard title="Total Patients" value={stats.totalPatients} />
          <StatCard title="Total Appointments" value={stats.totalAppointments} />
          <StatCard title="Total Prescriptions" value={stats.totalPrescriptions} />
        </div>

        {/* Recent Appointments */}
        <h4 className="mb-3">Recent Appointments</h4>
        {appointments.length === 0 ? (
          <p className="text-muted">No appointments found.</p>
        ) : (
          <div className="card shadow-sm p-3 border-0 rounded-3">
            <div className="table-responsive">
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
                  {appointments.map((appt) => (
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
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}

// Reusable StatCard Component
const StatCard = ({ title, value }) => (
  <div className="col-md-3">
    <div className="card shadow-sm text-center p-4 border-0 rounded-3">
      <h6 className="text-muted">{title}</h6>
      <h3 className="fw-bold">{value}</h3>
    </div>
  </div>
);
