import React, { useState } from "react";

function Pedidos() {
  const [filtro, setFiltro] = useState("Todos");

  const pedidos = [
    {
      id: "1024",
      cliente: "Lucas Sant'Ana",
      horario: "14:32",
      tipo: "Entrega",
      itens: "3 itens",
      valor: "R$ 75,70",
      status: "Em preparação",
      statusClass: "preparing",
    },
    {
      id: "1023",
      cliente: "Mariana Silva",
      horario: "14:18",
      tipo: "Entrega",
      itens: "2 itens",
      valor: "R$ 42,50",
      status: "Recebido",
      statusClass: "received",
    },
    {
      id: "1022",
      cliente: "João Pedro",
      horario: "13:56",
      tipo: "Retirada",
      itens: "4 itens",
      valor: "R$ 68,90",
      status: "Pronto",
      statusClass: "ready",
    },
    {
      id: "1021",
      cliente: "Ana Costa",
      horario: "13:41",
      tipo: "Entrega",
      itens: "2 itens",
      valor: "R$ 31,90",
      status: "Entregue",
      statusClass: "delivered",
    },
    {
      id: "1020",
      cliente: "Carlos Oliveira",
      horario: "13:25",
      tipo: "Entrega",
      itens: "5 itens",
      valor: "R$ 92,40",
      status: "Em preparação",
      statusClass: "preparing",
    },
    {
      id: "1019",
      cliente: "Fernanda Souza",
      horario: "13:04",
      tipo: "Retirada",
      itens: "1 item",
      valor: "R$ 18,90",
      status: "Entregue",
      statusClass: "delivered",
    },
  ];

  const filtros = [
    "Todos",
    "Recebido",
    "Em preparação",
    "Pronto",
    "Saiu para entrega",
    "Entregue",
  ];

  const pedidosFiltrados =
    filtro === "Todos"
      ? pedidos
      : pedidos.filter((pedido) => pedido.status === filtro);

  return (
    <main className="admin-orders-page">
      <div className="admin-container">

        {/* CABEÇALHO */}
        <section className="admin-page-header">
          <div>
            <span className="eyebrow">
              OPERAÇÃO
            </span>

            <h1>Pedidos</h1>

            <p>
              Acompanhe e gerencie os pedidos da loja.
            </p>
          </div>
        </section>

        {/* FILTROS */}
        <section className="admin-order-filters">
          {filtros.map((item) => (
            <button
              type="button"
              key={item}
              className={
                filtro === item
                  ? "admin-filter-button active"
                  : "admin-filter-button"
              }
              onClick={() => setFiltro(item)}
            >
              {item}
            </button>
          ))}
        </section>

        {/* LISTA */}
        <section className="admin-panel">

          <div className="admin-orders-table-header">
            <span>Pedido</span>
            <span>Cliente</span>
            <span>Horário</span>
            <span>Tipo</span>
            <span>Status</span>
            <span>Total</span>
            <span></span>
          </div>

          <div className="admin-orders-list">

            {pedidosFiltrados.map((pedido) => (
              <article
                className="admin-order-row admin-order-table-row"
                key={pedido.id}
              >

                <div className="admin-order-number">
                  #{pedido.id}
                </div>

                <div className="admin-order-client">
                  <strong>{pedido.cliente}</strong>
                  <span>{pedido.itens}</span>
                </div>

                <div className="admin-order-time">
                  {pedido.horario}
                </div>

                <div className="admin-order-type">
                  {pedido.tipo}
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

                <a
                  href={`/admin/pedido?id=${pedido.id}`}
                  className="admin-order-link"
                >
                  Ver →
                </a>

              </article>
            ))}

          </div>

          {pedidosFiltrados.length === 0 && (
            <div className="admin-orders-empty">
              <span>📦</span>

              <h2>Nenhum pedido encontrado</h2>

              <p>
                Não existem pedidos com o filtro selecionado.
              </p>
            </div>
          )}

        </section>

      </div>
    </main>
  );
}

export default Pedidos;