import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="layout-wrapper">
      <div className="layout-main">

        {/* Admin Sidebar */}
        <div className="sidebar-wrapper">
          <AdminSidebar />
        </div>

        {/* Main Content */}
        <div className="content-wrapper">
          <div className="content-inner">{children}</div>
        </div>
      </div>
    </div>
  );
}
