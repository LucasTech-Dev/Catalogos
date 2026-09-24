import React, { useMemo, useState } from "react";

function Clientes() {
  const [busca, setBusca] = useState("");

  const [clientes] = useState([
    {
      id: 1,
      nome: "Lucas Sant'Ana",
      email: "lucas@email.com",
      telefone: "(51) 99999-9999",
      pedidos: 12,
      totalGasto: "R$ 428,70",
      ultimoPedido: "Hoje, 14:32",
      status: "Ativo",
    },
    {
      id: 2,
      nome: "Mariana Silva",
      email: "mariana@email.com",
      telefone: "(51) 98888-8888",
      pedidos: 8,
      totalGasto: "R$ 286,40",
      ultimoPedido: "Ontem, 20:15",
      status: "Ativo",
    },
    {
      id: 3,
      nome: "João Pereira",
      email: "joao@email.com",
      telefone: "(51) 97777-7777",
      pedidos: 5,
      totalGasto: "R$ 174,90",
      ultimoPedido: "18/09/2026",
      status: "Ativo",
    },
    {
      id: 4,
      nome: "Ana Costa",
      email: "ana@email.com",
      telefone: "(51) 96666-6666",
      pedidos: 2,
      totalGasto: "R$ 79,80",
      ultimoPedido: "12/09/2026",
      status: "Inativo",
    },
  ]);

  const clientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) {
      return clientes;
    }

    return clientes.filter((cliente) =>
      `${cliente.nome} ${cliente.email} ${cliente.telefone}`
        .toLowerCase()
        .includes(termo)
    );
  }, [busca, clientes]);

  return (
    <main className="admin-customers-page">
      <div className="admin-container">
        <section className="admin-page-header">
          <div>
            <span className="eyebrow">RELACIONAMENTO</span>
            <h1>Clientes</h1>
            <p>Consulte os clientes que realizaram pedidos.</p>
          </div>
        </section>

        <section className="admin-customers-panel">
          <div className="admin-customers-toolbar">
            <div className="admin-customers-search">
              <span>⌕</span>

              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome, e-mail ou telefone..."
              />
            </div>

            <span className="admin-customers-count">
              {clientesFiltrados.length}{" "}
              {clientesFiltrados.length === 1
                ? "cliente"
                : "clientes"}
            </span>
          </div>

          {clientesFiltrados.length > 0 ? (
            <div className="admin-customers-list">
              <div className="admin-customers-table-header">
                <span>Cliente</span>
                <span>Pedidos</span>
                <span>Total gasto</span>
                <span>Último pedido</span>
                <span>Status</span>
                <span></span>
              </div>

              {clientesFiltrados.map((cliente) => (
                <article
                  className="admin-customer-row"
                  key={cliente.id}
                >
                  <div className="admin-customer-main">
                    <div className="admin-customer-avatar">
                      {cliente.nome.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2>{cliente.nome}</h2>
                      <p>{cliente.email}</p>
                      <span>{cliente.telefone}</span>
                    </div>
                  </div>

                  <div className="admin-customer-stat">
                    <strong>{cliente.pedidos}</strong>
                    <span>
                      {cliente.pedidos === 1
                        ? "pedido"
                        : "pedidos"}
                    </span>
                  </div>

                  <div className="admin-customer-stat">
                    <strong>{cliente.totalGasto}</strong>
                    <span>total</span>
                  </div>

                  <div className="admin-customer-last-order">
                    {cliente.ultimoPedido}
                  </div>

                  <div>
                    <span
                      className={
                        cliente.status === "Ativo"
                          ? "admin-status active"
                          : "admin-status inactive"
                      }
                    >
                      {cliente.status}
                    </span>
                  </div>

                  <div className="admin-customer-actions">
                    <button type="button">
                      Ver cliente
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">👤</div>

              <h2>Nenhum cliente encontrado</h2>

              <p>
                Tente buscar utilizando outro nome, e-mail ou
                telefone.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Clientes;