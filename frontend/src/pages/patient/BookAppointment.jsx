import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctor/all");
        setDoctors(res.data.doctors || []);
      } catch (err) {
        toast.error("Failed to load doctors");
      }
    };
    fetchDoctors();
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!doctor || !date || !reason.trim()) {
    toast.warning("Please fill all fields correctly");
    return;
  }

  setLoading(true);
  try {
    await api.post("/appointments", {
      doctor,
      date: new Date(date).toISOString(),   // ✅ Fix here
      reason,
    });

    toast.success("Appointment booked successfully!");
    navigate("/patient/appointments");
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to book appointment");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="container py-4">
      {/* 🔹 Navigation Buttons */}
      <div className="d-flex justify-content-end gap-2 mb-3">
        <Link to="/patient/dashboard" className="btn btn-outline-secondary">
          ← Dashboard
        </Link>
        <Link to="/patient/appointments" className="btn btn-outline-primary">
          My Appointments
        </Link>
      </div>

      <div className="card shadow-lg p-4 mx-auto" style={{ maxWidth: "650px" }}>
        <h2 className="text-primary mb-3 text-center fw-bold">
          Book Appointment
        </h2>
        <p className="text-muted text-center mb-4">
          Select your doctor, choose a date and time, and briefly mention your
          reason for consultation.
        </p>

        {doctors.length === 0 ? (
          <div className="alert alert-warning text-center">
            No doctors available at the moment. Please try again later.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Doctor Selection */}
            <div className="mb-3">
              <label className="form-label fw-bold">Select Doctor</label>
              <select
                className="form-select"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                required
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    Dr. {d.name.replace(/^Dr\.\s*/, "")}
                    {d.specialization ? ` — ${d.specialization}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="mb-3">
              <label className="form-label fw-bold me-3">Preferred Date & Time</label>
              <DatePicker
                selected={date}
                onChange={(newDate) => setDate(newDate)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="dd MMM yyyy — hh:mm a"
                placeholderText="Select appointment date and time"
                minDate={new Date()}
                className="form-control"
                required
              />
            </div>

            {/* Reason */}
            <div className="mb-3">
              <label className="form-label fw-bold">Reason / Symptoms</label>
              <textarea
                className="form-control"
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe symptoms or reason (e.g. fever, pain, regular check-up)"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                className="btn btn-success px-4 fw-bold"
                disabled={loading}
                type="submit"
              >
                {loading ? "Booking..." : "Confirm Appointment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
