// frontend/src/components/DoctorLayout.jsx
import { useState } from "react";
import DoctorSidebar from "./DoctorSidebar";
import Footer from "./Footer";

export default function DoctorLayout({ children }) {
  return (
    <div className="layout-wrapper">
      <div className="sidebar-wrapper">
        <DoctorSidebar />
      </div>

      <div className="content-wrapper">
        <div className="content-inner">{children}</div>
      </div>

      <Footer />   {/* Footer remains here, outside content-wrapper */}
    </div>
  );
}
