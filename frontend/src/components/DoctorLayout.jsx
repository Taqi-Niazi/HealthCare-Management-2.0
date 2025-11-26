import { useState } from "react";
import DoctorSidebar from "./DoctorSidebar";
import Footer from "./Footer";

export default function DoctorLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="layout-wrapper">

      <div className="layout-main">
        <div className={`sidebar-wrapper ${isOpen ? "show" : ""}`}>
          <DoctorSidebar />
        </div>

        {/* CONTENT */}
        <div
          className="content-wrapper"
          onClick={() => isOpen && setIsOpen(false)}
        >
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}
