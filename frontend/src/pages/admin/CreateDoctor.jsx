import { useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/AdminSidebar";
import "../../styles/AdminLayout.css";

export default function CreateDoctor() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register-doctor", { name, email, password });
      toast.success("Doctor account created!");
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      toast.error("Failed to create doctor");
    }
  };

  return (
    <div className="d-flex">
      <div className="sidebar-wrapper">
        <AdminSidebar />
      </div>

      <div className="content-wrapper">
        <div className="container py-4" style={{ maxWidth: "650px" }}>
          <h2 className="text-primary mb-4">Create Doctor Account</h2>
          <div className="card shadow-sm p-4 border-0 rounded-3">
            <form onSubmit={handleSubmit}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Doctor Name"
                className="form-control mb-3"
                required
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Doctor Email"
                className="form-control mb-3"
                required
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                className="form-control mb-3"
                required
              />
              <button className="btn btn-primary w-100">Create Doctor</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
