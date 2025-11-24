import { Link } from "react-router-dom";
import { useState } from "react";
import "./DoctorSidebar.css"; // We'll add minimal custom styling

export default function DoctorSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        className="btn btn-primary d-md-none m-2"
        onClick={() => setIsOpen(true)}
      >
        ☰ Menu
      </button>

      {/* Sidebar - Offcanvas for mobile, static for desktop */}
      <div
        className={`sidebar bg-light border-end p-3 ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        {/* Close button for mobile */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="text-primary">Doctor Panel</h4>
          <button
            className="btn-close d-md-none"
            onClick={() => setIsOpen(false)}
          ></button>
        </div>

        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link className="nav-link" to="/doctor/dashboard">
              🏠 Dashboard
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link" to="/doctor/appointments">
              📅 Appointments
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link" to="/doctor/patients">
              👥 Patients
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link" to="/doctor/create-prescription">
              ✍️ Create Prescription
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link" to="/doctor/prescriptions">
              💊 Prescriptions
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
