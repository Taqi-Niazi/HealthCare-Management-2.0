import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { format } from "date-fns";
import { toast } from "react-toastify";
import DoctorSidebar from "../../components/DoctorSidebar";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load appointments");
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const markCompleted = async (id) => {
    try {
      const res = await api.put(`/appointments/${id}`, { status: "completed" });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? res.data.updated || res.data : a))
      );
      toast.success("Appointment marked as completed");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not update appointment");
    }
  };

  const removeAppointment = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Appointment deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not delete appointment");
    }
  };

  if (loading) return <div className="container mt-5">Loading appointments...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  const upcoming = appointments
    .filter((a) => new Date(a.date) >= new Date())
    .sort((x, y) => new Date(x.date) - new Date(y.date));

  const past = appointments
    .filter((a) => new Date(a.date) < new Date())
    .sort((x, y) => new Date(y.date) - new Date(x.date));

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <DoctorSidebar />

      {/* Main Content */}
      <div className="flex-grow-1 ms-md-5 ps-md-4 container py-4">
        <h2 className="text-primary mb-4">Appointments</h2>

        {/* Upcoming Appointments */}
        <div className="mb-5">
          <h4 className="text-success">Upcoming Appointments</h4>
          {upcoming.length === 0 ? (
            <p>No upcoming appointments.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ minWidth: "130px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((a) => (
                    <tr key={a._id}>
                      <td>{a.patientName || "Unknown"}</td>
                      <td>{format(new Date(a.date), "PPPpp")}</td>
                      <td style={{ whiteSpace: "normal", maxWidth: "200px" }}>
                        {a.reason || "—"}
                      </td>
                      <td>
                        <span className="badge bg-warning">
                          {a.status || "Scheduled"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => markCompleted(a._id)}
                          >
                            ✔ Complete
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => removeAppointment(a._id)}
                          >
                            🗑️ Delete
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

        {/* Past Appointments */}
        <div>
          <h4 className="text-secondary">Past Appointments</h4>
          {past.length === 0 ? (
            <p>No past appointments.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ minWidth: "100px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map((a) => (
                    <tr key={a._id}>
                      <td>{a.patientName || "Unknown"}</td>
                      <td>{format(new Date(a.date), "PPPpp")}</td>
                      <td style={{ whiteSpace: "normal", maxWidth: "200px" }}>
                        {a.reason || "—"}
                      </td>
                      <td>
                        <span className="badge bg-success">
                          {a.status || "Completed"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => removeAppointment(a._id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
