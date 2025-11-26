import { Link } from "react-router-dom";

export default function DoctorSidebar() {
  return (
    <div className="p-3">
      <h4 className="text-primary mb-4">Doctor Panel</h4>
      <ul className="nav flex-column">
        <li>
          <Link className="nav-link" to="/doctor/dashboard">
            🏠 Dashboard
          </Link>
        </li>
        <li>
          <Link className="nav-link" to="/doctor/appointments">
            📅 Appointments
          </Link>
        </li>
        <li>
          <Link className="nav-link" to="/doctor/create-prescription">
            ✍️ Create Prescription
          </Link>
        </li>
        <li>
          <Link className="nav-link" to="/doctor/prescriptions">
            💊 Prescriptions
          </Link>
        </li>
      </ul>
    </div>
  );
}
