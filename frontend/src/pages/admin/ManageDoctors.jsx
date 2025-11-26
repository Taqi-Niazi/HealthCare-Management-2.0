import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/AdminSidebar";
import "../../styles/AdminLayout.css";

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctor/all");
      setDoctors(res.data.doctors || []);
    } catch {
      toast.error("Failed to load doctors");
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await api.delete(`/doctor/${id}`);
      setDoctors((prev) => prev.filter((d) => d._id !== id));
      toast.success("Doctor deleted successfully");
    } catch {
      toast.error("Failed to delete doctor");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="d-flex">
      <div className="sidebar-wrapper">
        <AdminSidebar />
      </div>

      <div className="content-wrapper">
        <div className="container py-4">
          <h2 className="text-primary mb-4">Manage Doctors</h2>

          <div className="card shadow-sm p-3 border-0 rounded-3">
            <div className="table-responsive">
              <table className="table table-hover table-bordered align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th style={{ minWidth: "150px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
                        No doctors available.
                      </td>
                    </tr>
                  ) : (
                    doctors.map((d) => (
                      <tr key={d._id}>
                        <td>Dr. {d.name}</td>
                        <td>{d.email}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteDoctor(d._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
