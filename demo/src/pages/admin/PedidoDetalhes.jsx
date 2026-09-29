import React, { useState } from "react";

function PedidoDetalhes() {
  const [status, setStatus] = useState("Em preparação");

  const pedido = {
    id: "1024",
    data: "21 de setembro de 2026, 14:32",

    cliente: {
      nome: "Lucas Sant'Ana",
      telefone: "(51) 99999-9999",
      email: "lucas@email.com",
    },

    tipo: "Entrega",

    pagamento: {
      metodo: "PIX",
      status: "Pagamento confirmado",
    },

    itens: [
      {
        nome: "Classic Burger",
        descricao: "Pão brioche, hambúrguer artesanal e queijo",
        quantidade: 2,
        preco: "R$ 28,90",
      },
      {
        nome: "Batata Frita",
        descricao: "Porção individual",
        quantidade: 1,
        preco: "R$ 12,90",
      },
    ],

    subtotal: "R$ 70,70",
    entrega: "R$ 5,00",
    total: "R$ 75,70",

    endereco: {
      rua: "Rua Principal, 120",
      complemento: "Apartamento 302",
      bairro: "Centro",
      cidade: "Capão da Canoa - RS",
    },

    observacao: "Sem cebola no hambúrguer.",
  };

  const statusOptions = [
    "Recebido",
    "Pagamento confirmado",
    "Em preparação",
    "Pronto",
    "Saiu para entrega",
    "Entregue",
    "Cancelado",
  ];

  return (
    <main className="admin-order-details-page">
      <div className="admin-container">

        {/* TOPO */}
        <div className="admin-details-back">
          <a href="/admin/pedidos">
            ← Voltar para pedidos
          </a>
        </div>

        <section className="admin-order-details-header">

          <div>
            <span className="eyebrow">
              PEDIDO
            </span>

            <h1>#{pedido.id}</h1>

            <p>
              Realizado em {pedido.data}
            </p>
          </div>

          <div className="admin-order-details-status">

            <span className="admin-status-label">
              Status atual
            </span>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="admin-status-select"
            >
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

        </section>

        {/* CONTEÚDO */}
        <section className="admin-order-details-grid">

          {/* COLUNA PRINCIPAL */}
          <div className="admin-order-details-main">

            {/* ITENS */}
            <section className="admin-panel">

              <div className="admin-panel-header">
                <div>
                  <span className="eyebrow">
                    PEDIDO
                  </span>

                  <h2>Itens do pedido</h2>
                </div>
              </div>

              <div className="admin-order-items">

                {pedido.itens.map((item) => (
                  <article
                    className="admin-order-item"
                    key={item.nome}
                  >

                    <div className="admin-order-item-quantity">
                      {item.quantidade}x
                    </div>

                    <div className="admin-order-item-info">
                      <h3>{item.nome}</h3>

                      <p>{item.descricao}</p>
                    </div>

                    <strong>
                      {item.preco}
                    </strong>

                  </article>
                ))}

              </div>

              {/* RESUMO */}
              <div className="admin-order-total">

                <div>
                  <span>Subtotal</span>
                  <strong>{pedido.subtotal}</strong>
                </div>

                <div>
                  <span>Entrega</span>
                  <strong>{pedido.entrega}</strong>
                </div>

                <div className="admin-order-total-final">
                  <span>Total</span>
                  <strong>{pedido.total}</strong>
                </div>

              </div>

            </section>

            {/* OBSERVAÇÃO */}
            <section className="admin-panel admin-order-note">

              <div className="admin-panel-header">
                <div>
                  <span className="eyebrow">
                    OBSERVAÇÃO
                  </span>

                  <h2>Observação do cliente</h2>
                </div>
              </div>

              <p>
                {pedido.observacao}
              </p>

            </section>

          </div>

          {/* COLUNA LATERAL */}
          <aside className="admin-order-details-sidebar">

            {/* CLIENTE */}
            <section className="admin-panel">

              <div className="admin-panel-header">
                <div>
                  <span className="eyebrow">
                    CLIENTE
                  </span>

                  <h2>Dados do cliente</h2>
                </div>
              </div>

              <div className="admin-info-list">

                <div>
                  <span>Nome</span>
                  <strong>{pedido.cliente.nome}</strong>
                </div>

                <div>
                  <span>Telefone</span>
                  <strong>{pedido.cliente.telefone}</strong>
                </div>

                <div>
                  <span>E-mail</span>
                  <strong>{pedido.cliente.email}</strong>
                </div>

              </div>

            </section>

            {/* ENTREGA */}
            <section className="admin-panel">

              <div className="admin-panel-header">
                <div>
                  <span className="eyebrow">
                    ENTREGA
                  </span>

                  <h2>Endereço</h2>
                </div>
              </div>

              <div className="admin-address">

                <strong>
                  {pedido.endereco.rua}
                </strong>

                <span>
                  {pedido.endereco.complemento}
                </span>

                <span>
                  {pedido.endereco.bairro}
                </span>

                <span>
                  {pedido.endereco.cidade}
                </span>

              </div>

              <div className="admin-delivery-type">
                {pedido.tipo}
              </div>

            </section>

            {/* PAGAMENTO */}
            <section className="admin-panel">

              <div className="admin-panel-header">
                <div>
                  <span className="eyebrow">
                    PAGAMENTO
                  </span>

                  <h2>Informações</h2>
                </div>
              </div>

              <div className="admin-payment-info">

                <div>
                  <span>Método</span>
                  <strong>
                    {pedido.pagamento.metodo}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong className="payment-confirmed">
                    {pedido.pagamento.status}
                  </strong>
                </div>

              </div>

            </section>

          </aside>

        </section>

        {/* AÇÕES */}
        <section className="admin-order-actions">

          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => window.history.back()}
          >
            ← Voltar
          </button>

          <button
            type="button"
            className="admin-primary-button"
          >
            Salvar status
          </button>

        </section>

      </div>
    </main>
  );
}

export default PedidoDetalhes;