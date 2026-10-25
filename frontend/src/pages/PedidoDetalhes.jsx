import '../components/conta/areaCliente.css';
import AtualizarPedidos from '../components/conta/AtualizarPedidos';
import {statusPedido,dataPedido} from '../lib/pedidosApresentacao';
import {PageBoundary} from '../components/ui/PageLoader';
import React, {useCallback} from "react";

import {useRecurso} from '../hooks/useRecurso';
import {buscarPedido} from '../services/pedidosConta';
import {moeda} from '../lib/compras';
function PedidoDetalhes() {
  const id = new URLSearchParams(window.location.search).get('id');
  const ler=useCallback(()=>buscarPedido(id),[id]);
  const recurso=useRecurso(ler);
  const {dados,erro,carregando} = recurso;
  if (!dados) return <PageBoundary recursos={[recurso]}><main className="order-details-page customer-page"><p role="status">{erro || (carregando ? 'Carregando...' : 'Pedido não encontrado.')}</p><a href="/perfil/pedidos">Meus pedidos</a></main></PageBoundary>;
  const estado=statusPedido(dados.status);
  const pedido = {...dados,data:dataPedido(dados),subtotal:moeda(dados.subtotal),total:moeda(dados.total),entrega:moeda(dados.taxaEntrega),pagamento:dados.pagamento?.forma,endereco:dados.endereco || {},itens:dados.itens.map(i => ({...i,preco:moeda(i.subtotal)}))};
  return (<PageBoundary recursos={[recurso]}>
    <main className="order-details-page customer-page">
      <div className="order-details-container customer-container">

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

            <span data-status={pedido.status} className={"order-status-badge "+estado.classe}>
              <span className="order-status-dot" />
              {estado.nome}
            </span>
          </div>
        </div>

        <section className="order-tracking-card"><h2>Status: {estado.nome}</h2><p>Pagamento: {dados.pagamento?.status}</p>{dados.pagamento?.origem==='manual_estabelecimento' && <p>Registro manual do estabelecimento; não comprova liquidação bancária.</p>}<AtualizarPedidos recurso={recurso} detalhe/>{erro && <p role="alert">{erro}</p>}</section>
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
                  {dados.pagamento?.status}
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
    </main></PageBoundary>
  );
}

export default PedidoDetalhes;