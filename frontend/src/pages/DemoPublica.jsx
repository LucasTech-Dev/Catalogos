import React,{useEffect,useState} from 'react';
import {configuracaoAplicacao} from '../lib/ambienteAplicacao';
export default function DemoPublica() {
  const [dados,setDados]=useState(null),[erro,setErro]=useState(''),[categoria,setCategoria]=useState(''),[tentativa,setTentativa]=useState(0);
  const permitido=['/','/cardapio','/produto'].includes(window.location.pathname);
  useEffect(()=>{
    if(!permitido)return;
    const controller=new AbortController();let ativo=true;
    const timer=setTimeout(()=>controller.abort(),20000);
    async function carregar() {
      try {
        setErro('');const config=configuracaoAplicacao(import.meta.env,window.location.hostname);
        const r=await fetch(config.base+'/publico/lojas/loja-demo/catalogo',{method:'GET',credentials:'omit',signal:controller.signal});
        if(!r.ok)throw new Error();
        const d=await r.json();if(d?.loja?.id!=='loja-demo' || !Array.isArray(d.produtos) || !Array.isArray(d.categorias))throw new Error();
        if(ativo)setDados(d);
      }catch{if(ativo)setErro('Catálogo indisponível no momento. Tente novamente em instantes.');}
      finally{clearTimeout(timer);}
    }
    carregar();return ()=>{ativo=false;clearTimeout(timer);controller.abort();};
  },[permitido,tentativa]);
  const produtos=(dados?.produtos || []).filter(p=>!categoria || p.categoriaId===categoria);
  return <><header className="container"><a href="/">Catálogo</a> <a href="/cardapio">Cardápio</a></header>
    <main className="container section"><p role="status">Demonstração somente leitura. Pedidos, login e administração indisponíveis.</p>
      {!permitido?<><h1>Recurso indisponível nesta demonstração</h1><p>Nenhum pedido foi criado.</p><a href="/cardapio">Voltar ao cardápio</a></>:<>
        <h1>{dados?.loja?.nome || 'Catálogo de demonstração'}</h1>
        {erro?<p role="alert">{erro} <button onClick={()=>setTentativa(t=>t+1)}>Tentar novamente</button></p>:!dados?<p>Carregando catálogo...</p>:<>
          <nav className="category-filter" aria-label="Categorias"><button className="category-filter-button" aria-pressed={!categoria} onClick={()=>setCategoria('')}>Todos</button>{dados.categorias.map(c=><button className="category-filter-button" aria-pressed={categoria===c.id} key={c.id} onClick={()=>setCategoria(c.id)}>{c.nome}</button>)}</nav>
          <div className="products-grid">{produtos.map(p=><article className="product-card" key={p.id}>
            {p.imagem && <div className="product-image"><img src={p.imagem} alt={p.nome} loading="lazy" referrerPolicy="no-referrer"/></div>}
            <div className="product-content"><h2>{p.nome}</h2><p>{p.descricao}</p><p>{Number(p.preco).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p>
            {p.disponivel===false && <p>Indisponível</p>}</div>
          </article>)}</div><p>Checkout indisponível. Esta prévia não registra pedidos.</p>
        </>}
      </>}
    </main></>;
}
