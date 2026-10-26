import React,{useState,useCallback,useLayoutEffect,useRef,useEffect} from 'react';
import {numeroPedido} from '../../lib/numeroPedido';
import MaterialIcon from '../../components/ui/MaterialIcon';
import {notificar} from '../../lib/notificacoes';
import {confirmarAcao} from '../../components/ui/ToastProvider';
import {PageBoundary} from '../../components/ui/PageLoader';
import {admin,rotulosStatus,dataTexto} from '../../services/admin';
import {useAdminRecurso} from '../../hooks/useAdmin';
import {AdminState} from '../../components/admin/AdminState';
import {moeda} from '../../lib/compras';
import './PedidoDetalhes.css';
const formas={pix:'Pix',dinheiro:'Dinheiro',cartao_credito:'Cartão de crédito',cartao_debito:'Cartão de débito'};
const financeiros={pendente:'Pendente',confirmado:'Confirmado manualmente',recusado:'Recusado',cancelado:'Cancelado'};
const informado=v=>v || 'Não informado';
const valor=v=>Number.isFinite(v)?moeda(v):'Não informado';
function PedidoDetalhes(){
 const id=new URLSearchParams(window.location.search).get('id');
 const carregar=useCallback(()=>admin.buscar('pedidos',id || ''),[id]);
 const recurso=useAdminRecurso(carregar),[status,setStatus]=useState(''),[operacao,setOperacao]=useState('');
 const trava=useRef(false),ativo=useRef(true);
 useEffect(()=>{ativo.current=true;return()=>{ativo.current=false;};},[]);
 useLayoutEffect(()=>{if(recurso.dados)setStatus(recurso.dados.status);},[recurso.dados]);
 const dados=recurso.dados;
 const ocupado=Boolean(operacao)||recurso.carregando;
 async function atualizar(){
  if(trava.current||recurso.carregando)return;trava.current=true;setOperacao('leitura');
  try{const r=await recurso.atualizar();if(!ativo.current||r?.cancelado)return;notificar(r?.ok?'sucesso':'erro',r?.ok?'Pedido atualizado.':'Não foi possível atualizar o pedido. Tente novamente.');}
  finally{trava.current=false;if(ativo.current)setOperacao('');}
 }
 async function salvar(tipo,novo){
  if(trava.current||recurso.carregando||!dados)return;
  const permitidos=tipo==='status'?opcoes: dados.transicoesPagamento || [];
  if(!permitidos.includes(novo)||tipo==='status'&&novo===dados.status){notificar('erro','Transição não permitida. Atualize o pedido.');return;}
  trava.current=true;setOperacao('confirmacao');
  try{
   if(tipo==='pagamento'||novo==='cancelado'){
    const descricao=tipo==='pagamento'?`Alterar o pagamento para ${financeiros[novo] || novo}? Registro manual do estabelecimento; não comprova liquidação por instituição financeira.`:'Cancelar este pedido? O cancelamento não altera automaticamente o registro financeiro.';
    if(!await confirmarAcao(descricao,tipo==='pagamento'?'Confirmar alteração financeira':'Cancelar pedido'))return;
   }
   if(!ativo.current)return;setOperacao(tipo);
   const atualizado=await admin[tipo](id,novo,dados.revisaoAdministrativa);
   if(!ativo.current)return;
   // O serviço retorna uma releitura do servidor após a transação confirmada.
   recurso.setDados(atualizado);recurso.setErro('');
   notificar('sucesso',tipo==='pagamento'?'Registro manual do estabelecimento atualizado. Não comprova liquidação bancária.':'Status do pedido atualizado com sucesso!');
  }catch(e){
   if(ativo.current){
    if([401,403].includes(e.status)||e.code==='SESSION_CHANGED')recurso.setDados(null);
    notificar('erro',e.status===409?e.message:e.status===403?'Acesso negado. Confira sua sessão administrativa.':'Não foi possível atualizar o pedido. Tente novamente.');
   }
  }finally{trava.current=false;if(ativo.current)setOperacao('');}
 }
 const acao=(tipo,texto,icone='check')=><><MaterialIcon name={operacao===tipo?'refresh':icone} className={operacao===tipo?'order-action-spinner':''} size={18}/>{operacao===tipo?(tipo==='leitura'?'Atualizando...':'Salvando...'):texto}</>;
 if(!dados)return <PageBoundary recursos={[recurso]}><main className="admin-order-details-page"><div className="admin-container"><AdminState recurso={recurso}/><a href="/admin/pedidos">Voltar para pedidos</a></div></main></PageBoundary>;
 const opcoes=[dados.status,...(dados.transicoesStatus || []).filter(s=>s!=='pagamento_confirmado'||dados.pagamento?.status==='confirmado').filter(s=>s!=='pagamento_recusado'||dados.pagamento?.status==='recusado')];
 const cliente=dados.cliente || {},endereco=dados.endereco || {},pagamento=dados.pagamento || {};
 const historico=numeroPedido(dados)==='Sem número';
 return <PageBoundary recursos={[recurso]}><main className="admin-order-details-page"><div className="admin-container">
  <div className="admin-order-toolbar"><a href="/admin/pedidos"><MaterialIcon name="arrow_back" size={18}/>Voltar para pedidos</a><button type="button" className="admin-secondary-button" onClick={atualizar} disabled={ocupado} aria-busy={operacao==='leitura'}>{acao('leitura','Atualizar pedido','refresh')}</button></div>
  {recurso.erro&&<div className="admin-detail-read-error" role="alert"><p>{recurso.erro}</p><button type="button" className="admin-secondary-button" disabled={ocupado} onClick={atualizar}>Tentar novamente</button></div>}
  <header className="admin-order-details-header"><div><span className="eyebrow">PEDIDO</span><h1>{historico?'Pedido sem número':`Pedido #${numeroPedido(dados)}`}</h1><p>Realizado em {dataTexto(dados.criadoEm) || 'data não informada'}</p>{historico&&<p className="admin-legacy-note">Pedido histórico sem número comercial. Identificação original preservada.</p>}</div><span className="admin-detail-badge" data-status={dados.status}>{rotulosStatus[dados.status] || informado(dados.status)}</span></header>
  <section className="admin-order-details-grid"><div className="admin-order-details-main">
   <section className="admin-panel"><div className="admin-panel-header"><h2>Itens do pedido</h2></div><div className="admin-order-items">{(dados.itens || []).map((item,i)=><article className="admin-order-item" key={i}><div className="admin-order-item-quantity">{item.quantidade ?? '—'}x</div><div className="admin-order-item-info"><h3>{item.nome || 'Produto não informado'}</h3><p>Preço unitário: {valor(item.precoUnitario)}</p>{(item.observacao || item.descricao)&&<p>{item.observacao || item.descricao}</p>}</div><strong>{valor(item.subtotal)}</strong></article>)}{!dados.itens?.length&&<p>Itens não disponíveis neste pedido histórico.</p>}</div><div className="admin-order-total"><div><span>Subtotal</span><strong>{valor(dados.subtotal)}</strong></div><div><span>Entrega</span><strong>{valor(dados.taxaEntrega)}</strong></div>{dados.desconto>0&&<div><span>Desconto</span><strong>{valor(dados.desconto)}</strong></div>}<div className="admin-order-total-final"><span>Total definitivo</span><strong>{valor(dados.total)}</strong></div></div></section>
   <section className="admin-panel admin-order-note"><div className="admin-panel-header"><h2>Observação do cliente</h2></div><p>{dados.observacao || 'Sem observações.'}</p></section>
   <section className="admin-panel admin-operational-panel"><div className="admin-panel-header"><h2>Andamento do pedido</h2></div><label htmlFor="status-operacional">Novo status operacional</label><select id="status-operacional" className="admin-status-select" value={status} disabled={ocupado} onChange={e=>setStatus(e.target.value)}>{opcoes.map(s=><option key={s} value={s}>{rotulosStatus[s] || s}</option>)}</select><p className="admin-detail-help">Alterar o andamento não confirma nem modifica o pagamento.</p><button type="button" className="admin-primary-button" disabled={ocupado||status===dados.status} aria-busy={operacao==='status'} onClick={()=>salvar('status',status)}>{acao('status','Salvar status')}</button></section>
  </div><aside className="admin-order-details-sidebar">
   <section className="admin-panel"><div className="admin-panel-header"><h2>Dados do cliente</h2></div><dl className="admin-detail-list">{[['Nome',cliente.nome],['Telefone',cliente.telefone],['E-mail',cliente.email]].map(([nome,v])=><div key={nome}><dt>{nome}</dt><dd>{informado(v)}</dd></div>)}</dl></section>
   <section className="admin-panel"><div className="admin-panel-header"><h2>{dados.tipoEntrega==='retirada'?'Retirada no local':'Entrega'}</h2></div>{dados.tipoEntrega==='retirada'?<p className="admin-detail-help">Cliente retira no estabelecimento.</p>:<div className="admin-address"><strong>{informado(endereco.rua || endereco.logradouro)}{endereco.numero?`, ${endereco.numero}`:''}</strong><span>{informado(endereco.bairro)}</span><span>{[endereco.cidade,endereco.uf].filter(Boolean).join(' — ') || 'Não informado'}</span>{endereco.complemento&&<span>{endereco.complemento}</span>}</div>}</section>
   <section className="admin-panel"><div className="admin-panel-header"><h2>Pagamento</h2></div><dl className="admin-detail-list"><div><dt>Método</dt><dd>{formas[pagamento.forma] || informado(pagamento.forma)}</dd></div><div><dt>Status financeiro</dt><dd><span className="admin-detail-badge" data-payment={pagamento.status}>{financeiros[pagamento.status] || 'Não informado'}</span></dd></div></dl><p className="admin-detail-help">Registro manual do estabelecimento. Não representa confirmação bancária automática.</p><div className="admin-financial-actions">{(dados.transicoesPagamento || []).map(novo=><button key={novo} type="button" className="admin-secondary-button" disabled={ocupado} aria-busy={operacao==='pagamento'} onClick={()=>salvar('pagamento',novo)}>{acao('pagamento',({confirmado:'Confirmar pagamento',recusado:'Recusar pagamento',cancelado:'Cancelar pagamento'})[novo])}</button>)}</div></section>
  </aside></section>
 </div></main></PageBoundary>;
}
export default PedidoDetalhes;
