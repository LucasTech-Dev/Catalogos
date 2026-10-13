import React from "react";
import { LogOut, Menu, Settings, Store, X } from "lucide-react";

import {useAdminSessao} from "./AdminGate";
function AdminHeader({ onMenuClick, sidebarOpen }) {
  const sessao=useAdminSessao();
  const loja=sessao?.loja;
  return (
    <header className="admin-topbar">
      <button
        type="button"
        className="admin-menu-button"
        aria-label={
          sidebarOpen
            ? "Fechar menu administrativo"
            : "Abrir menu administrativo"
        }
        aria-expanded={sidebarOpen}
        onClick={onMenuClick}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <a href="/admin" className="admin-store-identity">
        <span className="admin-store-mark">
          <Store size={18} />
        </span>

        <span>
          <strong>{loja?.nome || "Loja"}</strong>
          <small>Área administrativa</small>
        </span>
      </a>

      <div className="admin-topbar-actions">
        <span className="admin-user-badge">{sessao?.email || "Admin"}</span>

        <a
          href="/admin/configuracoes"
          className="admin-icon-button"
          aria-label="Configurações"
        >
          <Settings size={18} />
        </a>

        <button
          type="button" onClick={() => sessao.sair()}
          className="admin-logout-button"
          aria-label="Sair"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
