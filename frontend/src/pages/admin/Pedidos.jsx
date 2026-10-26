import {numeroPedido} from "../../lib/numeroPedido";
import MaterialIcon from "../../components/ui/MaterialIcon";
import {PageBoundary} from '../../components/ui/PageLoader';
import React, { useState } from "react";

import {rotulosStatus,dataTexto,classeStatus} from "../../services/admin";
import {useAdminLista} from "../../hooks/useAdmin";
import {AdminState,AdminPaginacao} from "../../components/admin/AdminState";
import {moeda} from "../../lib/compras";
function Pedidos() {
  const [busca,setBusca]=useState(''),[numeroBusca,setNumeroBusca]=useState(null);
  const [filtro, setFiltro] = useState("Todos");

  const status=Object.keys(rotulosStatus).find(k=>rotulosStatus[k]===filtro);
  const recurso=useAdminLista('pedidos',{...(status?{status}:{}),...(numeroBusca?{numeroPedido:numeroBusca}:{})});
  const filtros=['Todos',...Object.values(rotulosStatus)];
  const pedidosFiltrados=recurso.itens.filter(p=>numeroBusca || !busca.trim() || (numeroPedido(p)+' '+(p.cliente?.nome || '')).toLocaleLowerCase('pt-BR').includes(busca.replace(/^#/,'').trim().toLocaleLowerCase('pt-BR'))).map(p=>({...p,cliente:p.cliente?.nome || 'Cliente',horario:dataTexto(p.criadoEm),tipo:p.tipoEntrega,itens:`${p.itens?.length || 0} itens`,valor:moeda(p.total),status:rotulosStatus[p.status] || p.status,statusClass:classeStatus[p.status] || ''}));
  return (<PageBoundary recursos={[recurso]}>
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

        <form className="admin-order-search" onSubmit={e=>{e.preventDefault();const n=busca.replace(/^#/,'').trim();setNumeroBusca(/^[1-9][0-9]{0,8}$/.test(n)?Number(n):null);}}><label htmlFor="busca-admin-pedido">Buscar pedido</label><input id="busca-admin-pedido" type="search" value={busca} onChange={e=>{setBusca(e.target.value);if(!e.target.value.trim())setNumeroBusca(null);}} placeholder="Número do pedido ou cliente"/><button type="submit" className="button">Buscar</button><small>Número exato: pesquisa na loja. Nome: filtra os pedidos carregados.</small></form>
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
                  #{numeroPedido(pedido)}
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
                  Ver <MaterialIcon name="arrow_forward"/>
                </a>

              </article>
            ))}

          </div>

          {pedidosFiltrados.length === 0 && (
            <div className="admin-orders-empty">
              <span><MaterialIcon name="inventory_2"/></span>

              <h2>Nenhum pedido encontrado</h2>

              <p>
                Não existem pedidos com o filtro selecionado.
              </p>
            </div>
          )}

        </section>

      </div>
    </main></PageBoundary>
  );
}

export default Pedidos;