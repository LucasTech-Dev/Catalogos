import './AdminPadrao.css';
import React, { useState,useEffect } from "react";

import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

function AdminLayout({ children, currentPath }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {setSidebarOpen(false);document.querySelector('.admin-menu-button')?.focus();};
  useEffect(()=>{if(!sidebarOpen)return;const esc=e=>{if(e.key==='Escape'){e.preventDefault();closeSidebar();}};document.addEventListener('keydown',esc);return()=>document.removeEventListener('keydown',esc);},[sidebarOpen]);
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
