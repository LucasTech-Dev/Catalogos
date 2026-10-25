import React from 'react';
import './PageLoader.css';
export function PageLoader({loja}) {
  return <div className="page-loader" role="status" aria-live="polite" aria-busy="true">
    {loja?.logo && <img className="page-loader-logo" src={loja.logo} alt={loja.nome || 'Loja'} onError={e=>{e.currentTarget.hidden=true;}}/>}
    <span className="page-loader-spinner" aria-hidden="true"/>
    <p>Carregando...</p>
    <span className="page-loader-description">Preparando as informações para você</span>
  </div>;
}
export function PageBoundary({recursos=[],loja,children}) {
  const pendentes=recursos.filter(r=>!r.pronto);
  const falhou=pendentes.find(r=>r.erro);
  if(falhou)return <div className="page-loader page-loader-error" role="alert">
    <h1>Não foi possível abrir esta página</h1><p>{falhou.erro}</p>
    {falhou.atualizar && <button type="button" className="button button-primary" onClick={falhou.atualizar}>Tentar novamente</button>}
    <a href="/">Voltar ao catálogo</a>
  </div>;
  if(pendentes.length)return <PageLoader loja={loja}/>;
  return children;
}
