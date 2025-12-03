import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "../../styles/AdminLayout.css";

export default function PatientDashboard() {
  const [presCount, setPresCount] = useState(0);
  const [apptCount, setApptCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatientDashboard = async () => {
      try {
        // 1️⃣ Get Logged-in User (patient)
        const userRes = await api.get("/auth/me");
        setPatient(userRes.data.user);

        // 2️⃣ Fetch patient's prescriptions
        const presRes = await api.get("/prescriptions");
        setPresCount(presRes.data.prescriptions?.length || 0);

        // 3️⃣ Fetch patient's appointments
        const apptRes = await api.get("/appointments");
        setApptCount(apptRes.data?.length || 0);
      } catch (err) {
        toast.error("Error loading patient dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDashboard();
  }, []);

  if (loading)
    return <div className="text-center mt-5">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Welcome, {patient?.name}</h2>
      <p className="text-muted mb-4">
        Manage your appointments and prescriptions easily.
      </p>

      <div className="stats-row">
        <PatientCard
          title="My Prescriptions"
          value={presCount}
          icon="💊"
          color="#4e73df"
          link="/patient/prescriptions"
          buttonText="View Prescriptions"
        />

        <PatientCard
          title="My Appointments"
          value={apptCount}
          icon="📅"
          color="#1cc88a"
          link="/patient/appointments"
          buttonText="View Appointments"
        />

        <PatientCard
          title="Book Appointment"
          icon="🩺"
          color="#f6c23e"
          link="/patient/book-appointment"
          buttonText="Book Now"
        />
      </div>
    </div>
  );
}

const PatientCard = ({ title, value, icon, color, link, buttonText }) => (
  <div
    className="stat-card shadow-sm text-center p-4 rounded-3"
    style={{ background: color, color: "white" }}
  >
    <div style={{ fontSize: "2.3rem" }}>{icon}</div>
    {value !== undefined && <h3 className="fw-bold mb-1">{value}</h3>}
    <p className="mb-3 small">{title}</p>
    <Link to={link} className="btn btn-light btn-sm rounded-pill px-3">
      {buttonText}
    </Link>
  </div>
);
