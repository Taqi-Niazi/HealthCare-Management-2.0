import { Link } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <div className="sidebar bg-light border-end vh-100 p-3">
      <h4 className="text-primary mb-4">Admin Panel</h4>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link className="nav-link" to="/admin/dashboard">📊 Dashboard</Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link" to="/admin/create-doctor">👨‍⚕️ Create Doctor</Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link" to="/admin/manage-doctors">🛠 Manage Doctors</Link>
        </li>
      </ul>
    </div>
  );
}
