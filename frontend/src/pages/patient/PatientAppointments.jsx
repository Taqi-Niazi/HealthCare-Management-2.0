import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data || []);
    } catch (err) {
      setError("Failed to load appointments");
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((appt) => appt._id !== id));
      toast.success("Appointment cancelled");
    } catch (err) {
      toast.error("Could not cancel appointment");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading)
    return <div className="container mt-4 text-center">Loading...</div>;
  if (error)
    return (
      <div className="container mt-4 text-danger text-center">{error}</div>
    );

  const upcoming = appointments.filter((a) => new Date(a.date) >= new Date());
  const past = appointments.filter((a) => new Date(a.date) < new Date());

  return (
    <div className="container py-4">
      <h2 className="text-success mb-4 text-center">My Appointments</h2>

      <div className="d-flex justify-content-end gap-2 mb-3">
        <Link to="/patient/dashboard" className="btn btn-outline-secondary">
          ← Dashboard
        </Link>
        <Link to="/patient/book-appointment" className="btn btn-success">
          + Book Appointment
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <section className="mb-5">
        <h4 className="text-primary">Upcoming Appointments</h4>
        {upcoming.length === 0 ? (
          <p>No upcoming appointments.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ minWidth: "110px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((appt) => (
                  <tr key={appt._id}>
                    <td>{appt.doctor?.name || appt.doctorName || "N/A"}</td>
                    <td>{new Date(appt.date).toLocaleString()}</td>
                    <td style={{ whiteSpace: "normal", maxWidth: "200px" }}>
                      {appt.reason}
                    </td>
                    <td>{appt.status || "Scheduled"}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2 justify-content-center">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteAppointment(appt._id)}
                        >
                          Cancel
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

      {/* Past Appointments */}
      <section>
        <h4 className="text-secondary">Past Appointments</h4>
        {past.length === 0 ? (
          <p>No past appointments.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {past.map((appt) => (
                  <tr key={appt._id}>
                    <td>{appt.doctor?.name || "N/A"}</td>
                    <td>{new Date(appt.date).toLocaleString()}</td>
                    <td style={{ whiteSpace: "normal", maxWidth: "200px" }}>
                      {appt.reason}
                    </td>
                    <td>{appt.status || "Completed"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
