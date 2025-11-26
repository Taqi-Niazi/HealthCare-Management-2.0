import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function PatientDashboard() {
  const [presCount, setPresCount] = useState(0);
  const [apptCount, setApptCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const presRes = await api.get("/prescriptions");
      setPresCount(
        presRes.data.prescriptions?.length || presRes.data?.length || 0
      );

      const apptRes = await api.get("/appointments");
      setApptCount(apptRes.data?.length || 0);
    } catch (err) {
      toast.error("Error loading patient dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="container mt-5 text-center">Loading Dashboard...</div>
    );

  return (
    <div className="container py-4">
      <h2 className="text-success mb-4">Patient Dashboard</h2>

      {/* Stats Cards */}
      <div className="row g-4">
        <div className="col-md-4 col-12">
          <div className="card shadow-sm text-center p-4 border-0 h-100">
            <h5>Total Prescriptions</h5>
            <h2 className="text-primary fw-bold">{presCount}</h2>
            <Link
              to="/patient/prescriptions"
              className="btn btn-outline-primary btn-sm mt-2"
            >
              View Prescriptions
            </Link>
          </div>
        </div>

        <div className="col-md-4 col-12">
          <div className="card shadow-sm text-center p-4 border-0 h-100">
            <h5>Appointments Booked</h5>
            <h2 className="text-primary fw-bold">{apptCount}</h2>
            <Link
              to="/patient/appointments"
              className="btn btn-outline-primary btn-sm mt-2"
            >
              View Appointments
            </Link>
          </div>
        </div>

        <div className="col-md-4 col-12">
          <div className="card shadow-sm text-center p-4 border-0 h-100">
            <h5>Book New Appointment</h5>
            <p className="text-muted small mb-2">
              Schedule a visit with available doctors.
            </p>
            <Link
              to="/patient/book-appointment"
              className="btn btn-success btn-sm"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
