import React, {useCallback,useState} from "react";
import {admin,rotulosStatus,dataTexto,classeStatus} from "../../services/admin";
import {useAdminRecurso} from "../../hooks/useAdmin";
import {AdminState} from "../../components/admin/AdminState";
import {moeda} from "../../lib/compras";

import AdminStatCard from "../../components/admin/AdminStatCard";

function Dashboard() {
  const hoje=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const [inicio,setInicio]=useState(hoje),[fim,setFim]=useState(hoje),[periodo,setPeriodo]=useState({inicio:hoje,fim:hoje});
  const carregar=useCallback(()=>admin.dashboard(periodo),[periodo]);const recurso=useAdminRecurso(carregar);const dados=recurso.dados;
  const stats=[{label:'Pedidos no período',value:dados?.pedidos ?? '—',description:'Pela data de criação',icon:'📦'},...Object.entries(rotulosStatus).map(([status,label])=>({label,value:dados?.porStatus?.[status] ?? '—',description:'Pedidos no período',icon:'📦'})),{label:'Produtos disponíveis',value:dados?.produtos?.disponiveis ?? '—',description:'Catálogo atual',icon:'🍔'},{label:'Produtos indisponíveis',value:dados?.produtos?.indisponiveis ?? '—',description:'Catálogo atual',icon:'🍔'}];
  const pedidosRecentes=(dados?.recentes || []).map(p=>({...p,cliente:p.cliente?.nome || 'Cliente',horario:dataTexto(p.criadoEm),valor:moeda(p.total),status:rotulosStatus[p.status] || p.status,statusClass:classeStatus[p.status] || ''}));
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
            {new Date().toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo"})}
          </div>
        </section>

        <AdminState recurso={recurso}/><form className="admin-products-controls" onSubmit={e=>{e.preventDefault();setPeriodo({inicio,fim});}}><label>De <input type="date" value={inicio} onChange={e=>setInicio(e.target.value)} required/></label><label>Até <input type="date" value={fim} onChange={e=>setFim(e.target.value)} required/></label><button className="admin-primary-button" disabled={recurso.carregando}>Consultar período</button><button type="button" onClick={recurso.atualizar}>Atualizar</button></form>
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

            {!recurso.carregando && !pedidosRecentes.length && <p>Nenhum pedido neste período.</p>}<div className="admin-orders-list">

              {pedidosRecentes.map((pedido) => (
                <article
                  className="admin-order-row"
                  key={pedido.id}
                >

                  <div className="admin-order-main">

                    <div className="admin-order-id"><a href={`/admin/pedido?id=${encodeURIComponent(pedido.id)}`}>
                      #{pedido.id}</a>
                    </div>

                    <div>
                      <h3>{pedido.cliente}</h3>

                      <p>
                        {pedido.horario}
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

                <h2>No período</h2>
              </div>
            </div>

            <div className="admin-revenue">

              <span>Pagamentos confirmados</span>

              <strong>
                {dados ? moeda(dados.valorPagamentosConfirmados) : "—"}
              </strong>

              <small>
                Pedidos criados no período, excluindo cancelados. Confirmação manual.
              </small>

            </div>

            <div className="admin-summary-item">
              <span>Valor dos pedidos</span>
              <strong>{dados ? moeda(dados.valorPedidos) : "—"}</strong>
            </div>

            <div className="admin-summary-item">
              <span>Pedidos recebidos</span>
              <strong>{dados?.porStatus?.recebido ?? "—"}</strong>
            </div>

            <div className="admin-summary-item">
              <span>Pedidos concluídos</span>
              <strong>{dados?.porStatus?.entregue ?? "—"}</strong>
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
