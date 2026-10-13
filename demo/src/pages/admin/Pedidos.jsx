import React, { useState } from "react";

import {rotulosStatus,dataTexto,classeStatus} from "../../services/admin";
import {useAdminLista} from "../../hooks/useAdmin";
import {AdminState,AdminPaginacao} from "../../components/admin/AdminState";
import {moeda} from "../../lib/compras";
function Pedidos() {
  const [filtro, setFiltro] = useState("Todos");

  const status=Object.keys(rotulosStatus).find(k=>rotulosStatus[k]===filtro);
  const recurso=useAdminLista('pedidos',status?{status}:{});
  const filtros=['Todos',...Object.values(rotulosStatus)];
  const pedidosFiltrados=recurso.itens.map(p=>({...p,cliente:p.cliente?.nome || 'Cliente',horario:dataTexto(p.criadoEm),tipo:p.tipoEntrega,itens:`${p.itens?.length || 0} itens`,valor:moeda(p.total),status:rotulosStatus[p.status] || p.status,statusClass:classeStatus[p.status] || ''}));
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

        <AdminState recurso={recurso}/><AdminPaginacao recurso={recurso}/>
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