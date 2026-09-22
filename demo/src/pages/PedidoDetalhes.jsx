import React from "react";

const pedido = {
  id: "1024",
  data: "Hoje, 14:32",
  status: "Em preparação",
  tipo: "Entrega",
  pagamento: "PIX",

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
};

function PedidoDetalhes() {
  return (
    <main className="order-details-page">
      <div className="container order-details-container">

        {/* CABEÇALHO */}
        <div className="order-details-top">
          <a href="/perfil/pedidos" className="back-link">
            ← Meus pedidos
          </a>

          <div className="order-details-heading">
            <div>
              <span className="eyebrow">
                PEDIDO
              </span>

              <h1>
                #{pedido.id}
              </h1>

              <p>
                {pedido.data}
              </p>
            </div>

            <span className="order-status-badge preparing">
              <span className="order-status-dot" />
              {pedido.status}
            </span>
          </div>
        </div>

        {/* ACOMPANHAMENTO */}
        <section className="order-tracking-card">

          <div className="order-section-heading">
            <div>
              <span className="eyebrow">
                ACOMPANHAMENTO
              </span>

              <h2>
                Seu pedido está sendo preparado
              </h2>
            </div>
          </div>

          <div className="order-timeline">

            <div className="timeline-item completed">
              <div className="timeline-icon">
                ✓
              </div>

              <div>
                <strong>
                  Pedido recebido
                </strong>

                <span>
                  Seu pedido foi recebido pela loja.
                </span>
              </div>
            </div>

            <div className="timeline-line active" />

            <div className="timeline-item completed">
              <div className="timeline-icon">
                ✓
              </div>

              <div>
                <strong>
                  Pagamento confirmado
                </strong>

                <span>
                  O pagamento foi confirmado.
                </span>
              </div>
            </div>

            <div className="timeline-line active" />

            <div className="timeline-item current">
              <div className="timeline-icon">
                🍔
              </div>

              <div>
                <strong>
                  Em preparação
                </strong>

                <span>
                  A loja está preparando seu pedido.
                </span>
              </div>
            </div>

            <div className="timeline-line" />

            <div className="timeline-item">
              <div className="timeline-icon">
                ✓
              </div>

              <div>
                <strong>
                  Pronto
                </strong>

                <span>
                  Seu pedido ficará pronto em breve.
                </span>
              </div>
            </div>

            <div className="timeline-line" />

            <div className="timeline-item">
              <div className="timeline-icon">
                🚴
              </div>

              <div>
                <strong>
                  Saiu para entrega
                </strong>

                <span>
                  O pedido será enviado até você.
                </span>
              </div>
            </div>

            <div className="timeline-line" />

            <div className="timeline-item">
              <div className="timeline-icon">
                ✓
              </div>

              <div>
                <strong>
                  Entregue
                </strong>

                <span>
                  Pedido finalizado.
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* PRODUTOS */}
        <section className="order-details-card">

          <div className="order-section-heading">
            <span className="eyebrow">
              SEU PEDIDO
            </span>

            <h2>
              Itens
            </h2>
          </div>

          <div className="order-products">

            {pedido.itens.map((item) => (
              <div
                className="order-product"
                key={item.nome}
              >
                <div className="order-product-quantity">
                  {item.quantidade}x
                </div>

                <div className="order-product-info">
                  <strong>
                    {item.nome}
                  </strong>

                  <span>
                    {item.descricao}
                  </span>
                </div>

                <strong className="order-product-price">
                  {item.preco}
                </strong>
              </div>
            ))}

          </div>

          <div className="order-summary">

            <div>
              <span>
                Subtotal
              </span>

              <strong>
                {pedido.subtotal}
              </strong>
            </div>

            <div>
              <span>
                Entrega
              </span>

              <strong>
                {pedido.entrega}
              </strong>
            </div>

            <div className="order-total-row">
              <span>
                Total
              </span>

              <strong>
                {pedido.total}
              </strong>
            </div>

          </div>
        </section>

        {/* ENTREGA E PAGAMENTO */}
        <div className="order-details-columns">

          <section className="order-details-card">

            <div className="order-section-heading">
              <span className="eyebrow">
                ENTREGA
              </span>

              <h2>
                Endereço
              </h2>
            </div>

            <div className="order-address">
              <strong>
                📍 Endereço de entrega
              </strong>

              <span>
                {pedido.endereco.rua}
              </span>

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

          </section>

          <section className="order-details-card">

            <div className="order-section-heading">
              <span className="eyebrow">
                PAGAMENTO
              </span>

              <h2>
                Forma de pagamento
              </h2>
            </div>

            <div className="order-payment">
              <span className="payment-icon">
                💳
              </span>

              <div>
                <strong>
                  {pedido.pagamento}
                </strong>

                <span>
                  Pagamento realizado
                </span>
              </div>
            </div>

          </section>

        </div>

        {/* AÇÕES */}
        <div className="order-details-actions">

          <a
            href="/cardapio"
            className="button button-primary"
          >
            Pedir novamente
          </a>

          <a
            href="/perfil/pedidos"
            className="button button-secondary"
          >
            Voltar aos pedidos
          </a>

        </div>

      </div>
    </main>
  );
}

export default PedidoDetalhes;