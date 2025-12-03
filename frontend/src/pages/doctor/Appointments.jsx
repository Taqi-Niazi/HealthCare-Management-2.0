import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { format } from "date-fns";
import { toast } from "react-toastify";
import DoctorSidebar from "../../components/DoctorSidebar";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data || []);
    } catch (err) {
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
      await api.put(`/appointments/${id}`, { status: "completed" });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "completed" } : a))
      );
      toast.success("Appointment marked as completed");
    } catch (err) {
      toast.error("Could not update appointment");
    }
  };

  const removeAppointment = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Appointment deleted");
    } catch (err) {
      toast.error("Could not delete appointment");
    }
  };

  if (loading)
    return <div className="container mt-5 text-center">Loading appointments...</div>;

  const upcoming = appointments.filter((a) => new Date(a.date) >= new Date());
  const past = appointments.filter((a) => new Date(a.date) < new Date());

  return (
    <div className="d-flex">
      <DoctorSidebar />

      <div className="flex-grow-1 ms-md-4 ps-md-3 container py-4">
        <h2 className="text-primary fw-bold mb-4 text-center">Doctor Appointments</h2>

        {/* 🔹 Upcoming Appointments */}
        <section className="mb-5">
          <h4 className="fw-semibold text-primary mb-3">Upcoming Appointments</h4>
          {upcoming.length === 0 ? (
            <p className="text-muted">No upcoming appointments.</p>
          ) : (
            <div className="table-responsive shadow-sm rounded">
              <table className="table table-bordered table-striped table-hover align-middle text-center">
                <thead className="table-dark">
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ minWidth: "160px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((a) => (
                    <tr key={a._id}>
                      <td>{a.patient?.name || "Unknown"}</td>
                      <td>{format(new Date(a.date), "dd MMM yyyy, hh:mm a")}</td>
                      <td style={{ whiteSpace: "normal", maxWidth: "240px" }}>
                        {a.reason || "--"}
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          {a.status || "Scheduled"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => markCompleted(a._id)}
                          >
                            Complete
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => removeAppointment(a._id)}
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
        </section>

        {/* 🔹 Past Appointments */}
        <section>
          <h4 className="fw-semibold text-secondary mb-3">Past Appointments</h4>
          {past.length === 0 ? (
            <p className="text-muted">No past appointments.</p>
          ) : (
            <div className="table-responsive shadow-sm rounded">
              <table className="table table-bordered table-striped align-middle text-center">
                <thead className="table-dark">
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map((a) => (
                    <tr key={a._id}>
                      <td>{a.patient?.name || "Unknown"}</td>
                      <td>{format(new Date(a.date), "dd MMM yyyy, hh:mm a")}</td>
                      <td style={{ whiteSpace: "normal", maxWidth: "240px" }}>
                        {a.reason || "--"}
                      </td>
                      <td>
                        <span className="badge bg-success">Completed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
