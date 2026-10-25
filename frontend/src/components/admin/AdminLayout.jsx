import React, { useState } from "react";

import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

function AdminLayout({ children, currentPath }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <div className="admin-layout">
      <AdminHeader
        onMenuClick={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      <AdminSidebar
        currentPath={currentPath}
        open={sidebarOpen}
        onNavigate={closeSidebar}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Fechar menu administrativo"
          onClick={closeSidebar}
        />
      )}

      <div className="admin-layout-content">{children}</div>
    </div>
  );
}

export default AdminLayout;
