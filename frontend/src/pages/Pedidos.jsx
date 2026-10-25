import React from "react";

import {useRecurso} from '../hooks/useRecurso';
import {listarPedidos} from '../services/pedidosConta';
import {moeda} from '../lib/compras';
function Pedidos() {
  const {dados,erro,carregando,atualizar} = useRecurso(listarPedidos,[]);
  const pedidos = dados.map(p => ({...p,total:moeda(p.total),tipo:p.tipoEntrega,itens:`${p.itens.length} itens`,data:p.criadoEm?._seconds ? new Date(p.criadoEm._seconds*1000).toLocaleString('pt-BR') : ''}));
  return (
    <main className="orders-page">
      <div className="container orders-container">

        {/* CABEÇALHO */}
        <div className="orders-top">
          <a href="/perfil" className="back-link">
            ← Minha conta
          </a>

          <span className="eyebrow">
            HISTÓRICO
          </span>

          <h1>
            Meus pedidos
          </h1>

          <p>
            Acompanhe seus pedidos e consulte suas compras anteriores.
          </p>
        </div>

        {/* LISTA DE PEDIDOS */}
        {carregando && <p>Carregando pedidos...</p>}{erro && <p role="alert">{erro}</p>}<button onClick={atualizar}>Atualizar pedidos</button><section className="orders-list">

          {pedidos.map((pedido) => (
            <article
              className="order-card"
              key={pedido.id}
            >

              <div className="order-main">

                <div className="order-number">
                  <span>
                    Pedido
                  </span>

                  <strong>
                    #{pedido.id}
                  </strong>
                </div>

                <div className="order-info">
                  <span>
                    {pedido.data}
                  </span>

                  <span className="order-separator">
                    •
                  </span>

                  <span>
                    {pedido.tipo}
                  </span>

                  <span className="order-separator">
                    •
                  </span>

                  <span>
                    {pedido.itens}
                  </span>
                </div>

              </div>

              <div className="order-status">
                <span
                  className={`order-status-badge ${pedido.statusClass}`}
                >
                  <span className="order-status-dot" />
                  {pedido.status}
                </span>
              </div>

              <div className="order-total">
                <span>
                  Total
                </span>

                <strong>
                  {pedido.total}
                </strong>
              </div>

              <a
                href={`/perfil/pedido?id=${pedido.id}`}
                className="order-details-link"
              >
                Ver pedido
                <span>
                  →
                </span>
              </a>

            </article>
          ))}

        </section>

        {/* ESTADO VAZIO — PREPARADO PARA FUTURO */}
        {pedidos.length === 0 && (
          <section className="orders-empty">

            <div className="orders-empty-icon">
              📦
            </div>

            <h2>
              Você ainda não fez nenhum pedido
            </h2>

            <p>
              Quando você fizer seu primeiro pedido,
              ele aparecerá aqui.
            </p>

            <a
              href="/cardapio"
              className="button button-primary"
            >
              Ver cardápio
            </a>

          </section>
        )}

        {/* CTA */}
        <div className="orders-bottom">
          <a
            href="/cardapio"
            className="button button-secondary"
          >
            Fazer novo pedido
          </a>
        </div>

      </div>
    </main>
  );
}

export default Pedidos;