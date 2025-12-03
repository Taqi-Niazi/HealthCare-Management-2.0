import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CreateDoctor from "./pages/admin/CreateDoctor";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageDoctors from "./pages/admin/ManageDoctors";
import PrescriptionView from "./pages/PrescriptionView";
import NotFound from "./pages/NotFound";
import Prescriptions from "./pages/doctor/Prescriptions";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Appointments from "./pages/doctor/Appointments";
import CreatePrescription from "./pages/doctor/CreatePrescription";

// Patient Pages
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import BookAppointment from "./pages/patient/BookAppointment";

import QRCodeScanner from "./pages/QRCodeScanner";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      {/* Layout wrapper */}
      <div className="d-flex flex-column min-vh-100">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/prescription/:id" element={<PrescriptionView />} />

          {/* Doctor Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<Appointments />} />
            <Route
              path="/doctor/create-prescription"
              element={<CreatePrescription />}
            />
            <Route path="/doctor/prescriptions" element={<Prescriptions />} />
          </Route>

          {/* Patient Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route
              path="/patient/appointments"
              element={<PatientAppointments />}
            />
            <Route
              path="/patient/book-appointment"
              element={<BookAppointment />}
            />
            <Route
              path="/patient/prescriptions"
              element={<PatientPrescriptions />}
            />
          </Route>

          {/* Shared (Doctor + Patient) */}
          <Route element={<ProtectedRoute allowedRoles={["doctor", "patient"]} />}
          >
            <Route path="/scan-prescription" element={<QRCodeScanner />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/manage-doctors" element={<ManageDoctors />} />
            <Route path="/admin/create-doctor" element={<CreateDoctor />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
