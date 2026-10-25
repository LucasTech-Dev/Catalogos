import React,{useEffect,useState} from 'react';
import {configuracaoAplicacao} from '../lib/ambienteAplicacao';
import './demoFixtures.css';

const dinheiro=centavos=>(centavos/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export default function DemoFixtures() {
  const [local,setLocal]=useState(()=>window.location.pathname+window.location.search);
  const [dados,setDados]=useState(null),[erro,setErro]=useState(''),[tentativa,setTentativa]=useState(0);
  const [categoria,setCategoria]=useState(''),[carrinho,setCarrinho]=useState({});
  const path=local.split('?')[0],permitido=['/','/cardapio','/produto','/carrinho'].includes(path);
  const id=new URLSearchParams(local.split('?')[1] || '').get('id');
  useEffect(()=>{const atualizar=()=>setLocal(window.location.pathname+window.location.search);window.addEventListener('popstate',atualizar);return ()=>window.removeEventListener('popstate',atualizar);},[]);
  function navegar(event,href){if(event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;event.preventDefault();history.pushState({},'',href);setLocal(href);window.scrollTo?.(0,0);}
  function link(href,label,extra={}){return <a href={href} onClick={e=>navegar(e,href)} {...extra}>{label}</a>;}
  useEffect(()=>{
    if(!permitido)return;
    let ativo=true;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
    (async()=>{try{
      setErro('');const config=configuracaoAplicacao(import.meta.env,window.location.hostname);
      const r=await fetch(config.base+'/publico/lojas/loja-demo/catalogo',{method:'GET',credentials:'omit',signal:controller.signal});
      if(!r.ok)throw new Error();const d=await r.json();
      if(d?.loja?.id!=='loja-demo' || typeof d.loja.nome!=='string' || !Array.isArray(d.categorias) || d.categorias.length>20 || !Array.isArray(d.produtos) || d.produtos.length>50 || d.categorias.some(c=>typeof c.id!=='string' || typeof c.nome!=='string') || d.produtos.some(p=>typeof p.id!=='string' || !/^[A-Za-z0-9_-]{1,128}$/.test(p.id) || typeof p.nome!=='string' || !Number.isFinite(p.preco) || p.preco<0 || p.preco>1000000))throw new Error();
      if(ativo)setDados(d);
    }catch{if(ativo)setErro('Não foi possível carregar a API. Na primeira visita, o servidor pode levar alguns instantes para iniciar.');}finally{clearTimeout(timer);}})();
    return ()=>{ativo=false;clearTimeout(timer);controller.abort();};
  },[permitido,tentativa]);
  const produtos=dados?.produtos || [],itens=produtos.filter(p=>carrinho[p.id]>0),quantidade=itens.reduce((s,p)=>s+carrinho[p.id],0);
  const total=itens.reduce((s,p)=>s+Math.round(p.preco*100)*carrinho[p.id],0);
  function alterar(p,delta){if(p.disponivel===false)return;setCarrinho(c=>({...c,[p.id]:Math.max(0,Math.min(20,(c[p.id] || 0)+delta))}));}
  function adicionar(p){return <button className="fixture-button" disabled={p.disponivel===false || (carrinho[p.id] || 0)>=20} onClick={()=>alterar(p,1)} aria-label={'Adicionar '+p.nome}>{p.disponivel===false?'Indisponível':'Adicionar ao carrinho'}</button>;}
  const selecionado=produtos.find(p=>p.id===id);
  return <div className="fixture-demo">
    <div className="fixture-banner" role="status">Demonstração com produtos fictícios. Nenhum pedido é enviado ou registrado.</div>
    <header className="fixture-header container">{link('/','Catálogos',{className:'fixture-brand'})}<nav aria-label="Navegação principal">{link('/','Início')}{link('/cardapio','Cardápio')}{link('/carrinho',`Carrinho (${quantidade})`)}</nav></header>
    <main className="container section">
      {!permitido?<><h1>Recurso indisponível nesta demonstração</h1><p>Login, administração e finalização de pedidos estão desativados. Nenhum pedido foi criado.</p>{link('/cardapio','Voltar ao cardápio')}</>:<>
        {erro?<div role="alert"><p>{erro}</p><button className="fixture-button" onClick={()=>setTentativa(t=>t+1)}>Tentar novamente</button></div>:!dados?<p role="status">Conectando à API e carregando o catálogo…</p>:<>
          {path==='/' && <section className="fixture-hero"><span className="eyebrow">EXPLORE O CATÁLOGO</span><h1>Encontre seu próximo favorito.</h1><p>Conheça os produtos, explore as categorias e experimente o carrinho. Tudo nesta prévia é demonstrativo.</p>{link('/cardapio','Explorar cardápio',{className:'fixture-button'})}</section>}
          {path==='/carrinho'?<section><h1>Carrinho demonstrativo</h1><p>Os itens ficam apenas na memória desta página. Atualizar ou fechar a página esvazia o carrinho.</p>{!itens.length?<p>Seu carrinho está vazio. {link('/cardapio','Explorar cardápio')}</p>:<>
            <ul className="fixture-cart">{itens.map(p=><li key={p.id}><div><h2>{p.nome}</h2><p>{dinheiro(Math.round(p.preco*100))} por unidade</p></div><div className="fixture-quantity"><button aria-label={'Diminuir '+p.nome} onClick={()=>alterar(p,-1)}>−</button><output aria-label={'Quantidade de '+p.nome}>{carrinho[p.id]}</output><button aria-label={'Aumentar '+p.nome} disabled={carrinho[p.id]>=20} onClick={()=>alterar(p,1)}>+</button><button aria-label={'Remover '+p.nome} onClick={()=>setCarrinho(c=>({...c,[p.id]:0}))}>Remover</button></div></li>)}</ul>
            <p className="fixture-total">Total demonstrativo: {dinheiro(total)}</p><button className="fixture-button" onClick={()=>setCarrinho({})}>Esvaziar carrinho</button>
          </>}<p>Finalização indisponível. Este carrinho não gera pedido, pagamento ou mensagem.</p></section>:path==='/produto'?<section>
            {selecionado?<><span className="eyebrow">PRODUTO FICTÍCIO</span><h1>{selecionado.nome}</h1><p>{selecionado.descricao}</p><p className="fixture-price">{dinheiro(Math.round(selecionado.preco*100))}</p>{adicionar(selecionado)}</>:<h1>Produto não encontrado</h1>}<p>{link('/cardapio','Voltar ao cardápio')}</p>
          </section>:<section><h2>{path==='/cardapio'?'Cardápio':dados.loja.nome}</h2><nav className="category-filter" aria-label="Categorias"><button className="category-filter-button" aria-pressed={!categoria} onClick={()=>setCategoria('')}>Todos</button>{dados.categorias.map(c=><button className="category-filter-button" key={c.id} aria-pressed={categoria===c.id} onClick={()=>setCategoria(c.id)}>{c.nome}</button>)}</nav>
            <div className="products-grid">{produtos.filter(p=>!categoria || p.categoriaId===categoria).map(p=><article className="product-card fixture-card" key={p.id}><div className="product-content"><span className="fixture-product-mark" aria-hidden="true">{p.categoriaId==='bebidas'?'◒':'◈'}</span><h3>{link('/produto?id='+encodeURIComponent(p.id),p.nome)}</h3><p>{p.descricao}</p><p className="fixture-price">{dinheiro(Math.round(p.preco*100))}</p>{adicionar(p)}</div></article>)}</div>
          </section>}
        </>}
      </>}
    </main><footer className="container fixture-footer">Catálogos · Prévia funcional · Login, pagamentos e pedidos reais indisponíveis.</footer>
  </div>;
}
