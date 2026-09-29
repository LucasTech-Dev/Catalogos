import React from "react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  FolderTree,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: BarChart3,
    exact: true,
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: ClipboardList,
    aliases: ["/admin/pedido"],
  },
  {
    label: "Produtos",
    href: "/admin/produtos",
    icon: Boxes,
    aliases: ["/admin/produto", "/admin/produto/novo"],
  },
  {
    label: "Categorias",
    href: "/admin/categorias",
    icon: FolderTree,
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: Users,
  },
  {
    label: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings,
  },
];

function isActive(item, currentPath) {
  if (item.exact) {
    return currentPath === item.href;
  }

  return (
    currentPath === item.href ||
    item.aliases?.some((alias) => currentPath === alias)
  );
}

function AdminSidebar({ currentPath, open, onNavigate }) {
  return (
    <aside
      className={
        open
          ? "admin-sidebar admin-sidebar-open"
          : "admin-sidebar"
      }
      aria-label="Navegação administrativa"
    >
      <div className="admin-sidebar-brand">
        <span>ADMIN</span>
        <strong>Lancheria Demo</strong>
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item, currentPath);

          return (
            <a
              key={item.href}
              href={item.href}
              className={
                active
                  ? "admin-sidebar-link active"
                  : "admin-sidebar-link"
              }
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <a
        href="/login"
        className="admin-sidebar-exit"
        onClick={onNavigate}
      >
        <LogOut size={18} />
        <span>Sair</span>
      </a>
    </aside>
  );
}

export default AdminSidebar;
