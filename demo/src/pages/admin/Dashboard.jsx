import React from "react";

import AdminStatCard from "../../components/admin/AdminStatCard";

function Dashboard() {
  const stats = [
    {
      label: "Pedidos hoje",
      value: "24",
      description: "Pedidos recebidos hoje",
      icon: "📦",
    },
    {
      label: "Pendentes",
      value: "5",
      description: "Aguardando atendimento",
      icon: "⏳",
    },
    {
      label: "Em preparação",
      value: "8",
      description: "Pedidos em produção",
      icon: "👨‍🍳",
    },
    {
      label: "Concluídos",
      value: "11",
      description: "Pedidos finalizados",
      icon: "✅",
    },
  ];

  const pedidosRecentes = [
    {
      id: "1024",
      cliente: "Lucas Sant'Ana",
      horario: "14:32",
      valor: "R$ 75,70",
      status: "Em preparação",
      statusClass: "preparing",
    },
    {
      id: "1023",
      cliente: "Mariana Silva",
      horario: "14:18",
      valor: "R$ 42,50",
      status: "Recebido",
      statusClass: "received",
    },
    {
      id: "1022",
      cliente: "João Pedro",
      horario: "13:56",
      valor: "R$ 68,90",
      status: "Pronto",
      statusClass: "ready",
    },
    {
      id: "1021",
      cliente: "Ana Costa",
      horario: "13:41",
      valor: "R$ 31,90",
      status: "Entregue",
      statusClass: "delivered",
    },
  ];

  return (
    <main className="admin-dashboard">
      <div className="admin-container">

        {/* CABEÇALHO */}
        <section className="admin-page-header">
          <div>
            <span className="eyebrow">
              PAINEL ADMINISTRATIVO
            </span>

            <h1>Dashboard</h1>

            <p>
              Acompanhe os principais dados da sua loja.
            </p>
          </div>

          <div className="admin-header-date">
            Hoje, 21 de setembro
          </div>
        </section>

        {/* ESTATÍSTICAS */}
        <section className="admin-stats">

          {stats.map((stat) => (
            <AdminStatCard
              key={stat.label}
              description={stat.description}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
            />
          ))}

        </section>

        {/* CONTEÚDO PRINCIPAL */}
        <section className="admin-dashboard-grid">

          {/* PEDIDOS RECENTES */}
          <div className="admin-panel admin-orders-panel">

            <div className="admin-panel-header">
              <div>
                <span className="eyebrow">
                  MOVIMENTAÇÃO
                </span>

                <h2>Pedidos recentes</h2>
              </div>

              <a href="/admin/pedidos">
                Ver todos →
              </a>
            </div>

            <div className="admin-orders-list">

              {pedidosRecentes.map((pedido) => (
                <article
                  className="admin-order-row"
                  key={pedido.id}
                >

                  <div className="admin-order-main">

                    <div className="admin-order-id">
                      #{pedido.id}
                    </div>

                    <div>
                      <h3>{pedido.cliente}</h3>

                      <p>
                        Hoje às {pedido.horario}
                      </p>
                    </div>

                  </div>

                  <div className="admin-order-status">
                    <span
                      className={`admin-status-badge ${pedido.statusClass}`}
                    >
                      {pedido.status}
                    </span>
                  </div>

                  <div className="admin-order-value">
                    {pedido.valor}
                  </div>

                </article>
              ))}

            </div>

          </div>

          {/* RESUMO DO DIA */}
          <div className="admin-panel admin-summary-panel">

            <div className="admin-panel-header">
              <div>
                <span className="eyebrow">
                  RESUMO
                </span>

                <h2>Hoje</h2>
              </div>
            </div>

            <div className="admin-revenue">

              <span>Faturamento</span>

              <strong>
                R$ 1.248,50
              </strong>

              <small>
                Valor demonstrativo
              </small>

            </div>

            <div className="admin-summary-item">
              <span>Ticket médio</span>
              <strong>R$ 52,02</strong>
            </div>

            <div className="admin-summary-item">
              <span>Pedidos recebidos</span>
              <strong>24</strong>
            </div>

            <div className="admin-summary-item">
              <span>Pedidos concluídos</span>
              <strong>11</strong>
            </div>

          </div>

        </section>

        {/* ATALHOS */}
        <section className="admin-panel admin-shortcuts-panel">

          <div className="admin-panel-header">
            <div>
              <span className="eyebrow">
                ACESSO RÁPIDO
              </span>

              <h2>Atalhos</h2>
            </div>
          </div>

          <div className="admin-shortcuts">

            <a
              href="/admin/produto/novo"
              className="admin-shortcut"
            >
              <span className="admin-shortcut-icon">
                ➕
              </span>

              <div>
                <h3>Novo produto</h3>
                <p>
                  Adicione um produto ao catálogo.
                </p>
              </div>

              <span className="admin-shortcut-arrow">
                →
              </span>
            </a>

            <a
              href="/admin/pedidos"
              className="admin-shortcut"
            >
              <span className="admin-shortcut-icon">
                📦
              </span>

              <div>
                <h3>Ver pedidos</h3>
                <p>
                  Acompanhe os pedidos da loja.
                </p>
              </div>

              <span className="admin-shortcut-arrow">
                →
              </span>
            </a>

            <a
              href="/admin/configuracoes"
              className="admin-shortcut"
            >
              <span className="admin-shortcut-icon">
                ⚙️
              </span>

              <div>
                <h3>Configurações</h3>
                <p>
                  Gerencie as configurações da loja.
                </p>
              </div>

              <span className="admin-shortcut-arrow">
                →
              </span>
            </a>

          </div>

        </section>

      </div>
    </main>
  );
}

export default Dashboard;
