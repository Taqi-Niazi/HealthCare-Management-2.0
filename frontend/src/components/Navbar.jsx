import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navLinkClasses = ({ isActive }) =>
    `nav-link ${isActive ? "fw-bold text-warning" : ""}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4 shadow-sm">
      <NavLink className="navbar-brand fw-bold" to="/">
        HCMS 2.0
      </NavLink>

      <button
        className="navbar-toggler"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto align-items-center">
          {/* Doctor Links */}
          {user?.role === "doctor" && (
            <>
              <li className="nav-item">
                <NavLink className={navLinkClasses} to="/doctor/dashboard">
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClasses} to="/doctor/appointments">
                  Appointments
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClasses} to="/doctor/patients">
                  Patients
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClasses} to="/doctor/prescriptions">
                  Prescriptions
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={navLinkClasses}
                  to="/doctor/create-prescription"
                >
                  Create Prescription
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClasses} to="/scan-prescription">
                  Scan QR
                </NavLink>
              </li>
            </>
          )}

          {/* Patient Links */}
          {user?.role === "patient" && (
            <>
              <li className="nav-item">
                <NavLink className={navLinkClasses} to="/patient/dashboard">
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/patient/book-appointment">
                  Book Appointment
                </Link>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClasses} to="/patient/appointments">
                  My Appointments
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClasses} to="/patient/prescriptions">
                  My Prescriptions
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClasses} to="/scan-prescription">
                  Scan QR
                </NavLink>
              </li>
            </>
          )}

          {/* Admin links */}
          {user?.role === "admin" && (
            <>
              <li className="nav-item">
                <NavLink className={navLinkClasses} to="/admin/dashboard">
                  Admin Panel
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={navLinkClasses} to="/admin/users">
                  Manage Users
                </NavLink>
              </li>
            </>
          )}

          {/* Logout Button */}
          {user && (
            <li className="nav-item ms-3">
              <button className="btn btn-sm btn-light" onClick={handleLogout}>
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
