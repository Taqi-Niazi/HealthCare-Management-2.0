import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import DoctorSidebar from "../../components/DoctorSidebar";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState(null);

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

  useEffect(() => {
    fetchDoctorData();
  }, []);

  if (!doctor)
    return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <DoctorSidebar />

      {/* Main content */}
      <div className="flex-grow-1 ms-md-5 ps-md-4 container py-4">
        <h2 className="text-primary mb-3">Welcome Dr. {doctor.name}</h2>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6>Total Patients</h6>
              <h3>{stats.totalPatients}</h3>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6>Total Appointments</h6>
              <h3>{stats.totalAppointments}</h3>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card p-3 shadow-sm text-center">
              <h6>Total Prescriptions</h6>
              <h3>{stats.totalPrescriptions}</h3>
            </div>
          </div>
        </div>

        {/* Recent Appointments */}
        <h4 className="mt-3 mb-3">Recent Appointments</h4>
        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
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
        )}
      </div>
    </div>
  );
}
