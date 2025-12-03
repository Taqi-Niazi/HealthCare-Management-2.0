import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // Safely parse user

  const role = user?.role?.toLowerCase(); // Get role from user object only

  // If not logged in → go to login page
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If role does not match allowed roles → deny access
  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
