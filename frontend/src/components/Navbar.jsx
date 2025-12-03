import { NavLink, useNavigate, Link } from "react-router-dom";
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
    `nav-link px-3 ${isActive ? "fw-bold text-warning" : "text-light"}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4 shadow">
      <Link className="navbar-brand fw-bold fs-4" to="/">
        🏥 HCMS 2.0
      </Link>

      <button
        className="navbar-toggler"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto align-items-center">

          {/* Dynamic Links by Role */}
          {user?.role === "doctor" && (
            <>
              <NavItem to="/doctor/dashboard" label="Dashboard" />
              <NavItem to="/doctor/appointments" label="Appointments" />
              <NavItem to="/doctor/prescriptions" label="Prescriptions" />
              <NavItem to="/doctor/create-prescription" label="Create Prescription" />
              <NavItem to="/scan-prescription" label="Scan QR" />
            </>
          )}

          {user?.role === "patient" && (
            <>
              <NavItem to="/patient/dashboard" label="Dashboard" />
              <NavItem to="/patient/book-appointment" label="Book Appointment" />
              <NavItem to="/patient/appointments" label="My Appointments" />
              <NavItem to="/patient/prescriptions" label="My Prescriptions" />
            </>
          )}

          {user?.role === "admin" && (
            <>
              <NavItem to="/admin/dashboard" label="Admin Dashboard" />
              <NavItem to="/admin/manage-doctors" label="Manage Doctors" />
              <NavItem to="/admin/create-doctor" label="Create Doctor" />
            </>
          )}

          {/* Right-side Profile Info */}
          {user && (
            <li className="nav-item dropdown ms-3">
              <button
                className="btn btn-sm btn-light dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                {user.name} <span className="badge bg-secondary">{user.role}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

function NavItem({ to, label }) {
  return (
    <li className="nav-item">
      <NavLink className={({ isActive }) => 
        `nav-link px-3 ${isActive ? "fw-bold text-warning" : "text-light"}`} 
        to={to}
      >
        {label}
      </NavLink>
    </li>
  );
}
