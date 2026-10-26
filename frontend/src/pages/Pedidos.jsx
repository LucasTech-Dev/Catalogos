import {numeroPedido} from "../lib/numeroPedido";
import MaterialIcon from "../components/ui/MaterialIcon";
import {PageBoundary} from '../components/ui/PageLoader';
import React,{useMemo,useState} from 'react';
import {Search,X,Package,ArrowRight} from "../components/ui/MaterialIcon";
import AtualizarPedidos from '../components/conta/AtualizarPedidos';
import {useRecurso} from '../hooks/useRecurso';
import {listarPedidos} from '../services/pedidosConta';
import {moeda} from '../lib/compras';
import {dataPedido,statusPedido,filtrarPedidos} from '../lib/pedidosApresentacao';
import '../components/conta/areaCliente.css';
function Pedidos(){
 const recurso=useRecurso(listarPedidos,[]);
 const {dados,erro,uid}=recurso;
 // Consulta e filtro pertencem à sessão atual, nunca à conta anterior.
 const [busca,setBusca]=useState({uid,consulta:'',status:''});
 const consulta=busca.uid===uid?busca.consulta:'',status=busca.uid===uid?busca.status:'';
 const alterar=valores=>setBusca({uid,consulta,status,...valores});
 const pedidos=useMemo(()=>filtrarPedidos(dados,consulta,status),[dados,consulta,status]);
 const estados=useMemo(()=>[...new Set(dados.map(p=>p.status).filter(Boolean))],[dados]);
 const limpar=()=>alterar({consulta:'',status:''});
 return <PageBoundary recursos={[recurso]}><main className="orders-page customer-page"><div className="orders-container customer-container">
  <header className="orders-top">
   <a href="/perfil" className="back-link"><MaterialIcon name="arrow_back"/> Minha conta</a>
   <span className="eyebrow">HISTÓRICO</span><h1>Meus pedidos</h1>
   <p>Acompanhe suas compras e consulte seus pedidos anteriores.</p>
  </header>
  <section className="orders-tools" aria-label="Pesquisar e filtrar pedidos">
   <div className="orders-controls">
    <div className="orders-search-field"><label htmlFor="busca-pedidos">Pesquisar pedidos</label>
     <div className="orders-search"><Search size={19} aria-hidden="true"/><input id="busca-pedidos" type="search" placeholder="Buscar por número, produto ou status..." value={consulta} maxLength={200} aria-describedby="alcance-pesquisa" onChange={e=>alterar({consulta:e.target.value})}/>{consulta&&<button type="button" aria-label="Limpar campo de pesquisa" onClick={()=>alterar({consulta:''})}><X size={17} aria-hidden="true"/></button>}</div>
    </div>
    <div className="orders-filter"><label htmlFor="status-pedidos">Status</label><select id="status-pedidos" value={status} onChange={e=>alterar({status:e.target.value})}><option value="">Todos os status</option>{estados.map(s=><option key={s} value={s}>{statusPedido(s).nome}</option>)}</select></div>
    <AtualizarPedidos recurso={recurso}/>
   </div>
   <div className="orders-search-summary"><p id="alcance-pesquisa">Busca nos {dados.length} pedidos carregados da sua conta.</p><span aria-live="polite">{pedidos.length} {pedidos.length===1?'pedido encontrado':'pedidos encontrados'}</span>{status&&<button type="button" className="orders-clear" onClick={limpar}>Limpar filtros</button>}</div>
  </section>
  {erro&&<p role="alert" className="customer-inline-error">{erro}</p>}
  {dados.length===0?<section className="orders-empty"><div className="orders-empty-icon"><Package size={28} aria-hidden="true"/></div><h2>Você ainda não fez nenhum pedido</h2><p>Quando você fizer seu primeiro pedido, ele aparecerá aqui.</p><a href="/cardapio" className="button button-primary">Ver cardápio</a></section>:
   pedidos.length===0?<section className="orders-empty"><div className="orders-empty-icon"><Search size={28} aria-hidden="true"/></div><h2>Nenhum pedido encontrado</h2><p>Tente outro termo de pesquisa.</p><button type="button" className="button button-secondary" onClick={limpar}>Limpar pesquisa</button></section>:
   <section className="orders-list" aria-label="Seus pedidos">{pedidos.map(pedido=>{
    const estado=statusPedido(pedido.status),data=dataPedido(pedido);
    const unidades=pedido.itens.reduce((s,i)=>s+i.quantidade,0);
    return <article className="order-card" key={pedido.id}>
     <div className="order-main"><div className="order-number"><span>Pedido</span><strong>#{numeroPedido(pedido)}</strong></div><div className="order-info">{data&&<span>{data}</span>}<span>{pedido.tipoEntrega==='retirada'?'Retirada':'Entrega'}</span><span>{unidades} {unidades===1?'item':'itens'}</span></div><p className="order-items-preview">{pedido.itens.map(i=>`${i.quantidade}× ${i.nome}`).join(' · ')}</p></div>
     <div className="order-status"><span data-status={pedido.status} className={'order-status-badge '+estado.classe}><span className="order-status-dot"/>{estado.nome}</span></div>
     <div className="order-total"><span>Total</span><strong>{moeda(pedido.total)}</strong></div>
     <a href={'/perfil/pedido?id='+encodeURIComponent(pedido.id)} className="order-details-link" aria-label={'Ver pedido '+numeroPedido(pedido)}>Ver pedido<ArrowRight size={16} aria-hidden="true"/></a>
    </article>;
   })}</section>}
  {dados.length>0&&<nav className="orders-bottom" aria-label="Continuar comprando"><a href="/cardapio" className="button button-secondary">Fazer novo pedido</a></nav>}
 </div></main></PageBoundary>;
}
export default Pedidos;
