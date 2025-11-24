import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container text-center py-5">
      <div className="card shadow p-5 mx-auto" style={{ maxWidth: "700px" }}>
        <h1 className="text-primary mb-3">Healthcare Management System 2.0</h1>
        <p className="lead mb-4">
          A secure and smart platform for doctors and patients with QR-enabled
          prescriptions, appointment booking, and real-time access.
        </p>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <Link to="/login" className="btn btn-primary px-4">
            Login
          </Link>
          <Link to="/register" className="btn btn-outline-primary px-4">
            Register
          </Link>
        </div>

        <p className="mt-4 text-muted small">
          Powered by MERN | Secure | QR Integrated | Email Notifications
        </p>
      </div>
    </div>
  );
}
