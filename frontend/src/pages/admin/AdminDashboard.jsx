import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import AdminLayout from "../../components/AdminLayout"; 
import "../../styles/AdminLayout.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data.stats || res.data);
      } catch (err) {
        toast.error("Failed to load admin dashboard");
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <AdminLayout>
      <div className="dashboard-container">
        <h2 className="dashboard-title text-success mb-5">Admin Dashboard</h2>

        {/* Stats Section */}
        <div className="stats-row">
          <StatCard title="Total Doctors" value={stats.totalDoctors} color="#007bff" />
          <StatCard title="Total Patients" value={stats.totalPatients} color="#28a745" />
          <StatCard title="Total Appointments" value={stats.totalAppointments} color="#ffc107" />
          <StatCard title="Total Prescriptions" value={stats.totalPrescriptions} color="#dc3545" />
        </div>
      </div>
    </AdminLayout>
  );
}

// StatCard Component
const StatCard = ({ title, value, color }) => (
  <div className="stat-card shadow-sm p-4 rounded-3 text-center" style={{ borderTop: `4px solid ${color}` }}>
    <h6 className="text-muted">{title}</h6>
    <h2 className="fw-bold">{value}</h2>
  </div>
);
