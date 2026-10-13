import React, { useState, useCallback, useEffect } from "react";

import {admin,rotulosStatus,dataTexto} from "../../services/admin";
import {useAdminRecurso} from "../../hooks/useAdmin";
import {AdminState} from "../../components/admin/AdminState";
import {moeda} from "../../lib/compras";
function PedidoDetalhes() {
  const id=new URLSearchParams(window.location.search).get('id');
  const carregar=useCallback(()=>admin.buscar('pedidos',id || ''),[id]);const recurso=useAdminRecurso(carregar);
  const [status,setStatus]=useState(''),[erro,setErro]=useState(''),[ocupado,setOcupado]=useState(false),[sucesso,setSucesso]=useState(''),[confirmacao,setConfirmacao]=useState('');
  useEffect(()=>{if(recurso.dados)setStatus(recurso.dados.status);},[recurso.dados]);
  async function atualizar(tipo,novoStatus){if(ocupado)return;setOcupado(true);setErro('');setSucesso('');try{await admin[tipo](id,novoStatus);await recurso.atualizar();setSucesso(tipo==='pagamento'?'Pagamento atualizado explicitamente.':'Status atualizado.');setConfirmacao('');}catch(e){setErro(e.message);}finally{setOcupado(false);}}
  if(!recurso.dados)return <main className="admin-order-details-page"><div className="admin-container"><AdminState recurso={recurso}/><a href="/admin/pedidos">Voltar para pedidos</a></div></main>;
  const dados=recurso.dados,pedido={...dados,data:dataTexto(dados.criadoEm),cliente:dados.cliente || {nome:'Cliente',telefone:'Não informado',email:'Não informado'},tipo:dados.tipoEntrega,pagamento:{...dados.pagamento,metodo:dados.pagamento?.forma},subtotal:moeda(dados.subtotal),entrega:moeda(dados.taxaEntrega),total:moeda(dados.total),endereco:dados.endereco || {rua:dados.tipoEntrega==='retirada'?'Retirada no local':'Endereço não disponível'},itens:dados.itens.map(i=>({...i,preco:moeda(i.subtotal)}))};
  const statusOptions=[dados.status,...(dados.transicoesStatus || []).filter(s=>s!=='pagamento_confirmado' || dados.pagamento?.status==='confirmado').filter(s=>s!=='pagamento_recusado' || dados.pagamento?.status==='recusado')];
  return (
    <main className="admin-order-details-page">
      <div className="admin-container">

        <AdminState recurso={recurso}/>{erro && <p role="alert">{erro}</p>}{sucesso && <p role="status">{sucesso}</p>}<button onClick={recurso.atualizar}>Atualizar pedido</button>
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
                  {rotulosStatus[item] || item}
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
                  <strong className={pedido.pagamento.status === "confirmado" ? "payment-confirmed" : ""}>
                    {pedido.pagamento.status}
                  </strong>
                </div>

              {(dados.transicoesPagamento || []).map(novo=><button key={novo} type="button" className="admin-secondary-button" disabled={ocupado} onClick={()=>setConfirmacao(novo)}>{{confirmado:'Confirmar pagamento',recusado:'Recusar pagamento',cancelado:'Cancelar pagamento'}[novo]}</button>)}
              {confirmacao && <div role="dialog" aria-label="Confirmar alteração financeira"><p>Alterar o pagamento para {confirmacao}? Esta ação financeira não é automática.</p><button disabled={ocupado} onClick={()=>atualizar('pagamento',confirmacao)}>Confirmar alteração financeira</button><button disabled={ocupado} onClick={()=>setConfirmacao('')}>Voltar</button></div>}
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
            className="admin-primary-button" disabled={ocupado || status === dados.status} onClick={()=>atualizar("status",status)}
          >
            Salvar status
          </button>

        </section>

      </div>
    </main>
  );
}

export default PedidoDetalhes;