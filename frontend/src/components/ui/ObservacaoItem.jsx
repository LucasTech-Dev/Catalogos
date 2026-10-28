import React, {useEffect, useState} from 'react';

/** Edita a observação sem reindexar a linha do carrinho a cada tecla digitada. */
export default function ObservacaoItem({item,onSalvar,disabled=false,compacto=false}){
  const [texto,setTexto]=useState(item.observacao || '');
  const [erro,setErro]=useState('');
  useEffect(()=>{setTexto(item.observacao || '');setErro('');},[item.chave,item.observacao]);
  function salvar(){
    const anterior=item.observacao || '';
    if(texto===anterior)return;
    if(onSalvar(item.chave || item.id,texto)===false){
      setTexto(anterior);
      setErro('Não foi possível salvar esta observação.');
    } else setErro('');
  }
  return <div className={`item-observation-editor${compacto?' item-observation-editor--compact':''}`}>
    <label htmlFor={`observacao-item-${encodeURIComponent(item.chave || item.id)}`}>Observações de {item.nome} <span>(opcional)</span></label>
    <textarea
      id={`observacao-item-${encodeURIComponent(item.chave || item.id)}`}
      value={texto}
      maxLength={1000}
      rows={compacto?2:3}
      placeholder="Ex.: sem sal, molho separado..."
      disabled={disabled}
      onChange={e=>setTexto(e.target.value)}
      onBlur={salvar}
      aria-describedby={erro?`erro-item-${encodeURIComponent(item.chave || item.id)}`:undefined}
    />
    <div className="item-observation-footnote">
      <span>Salva automaticamente ao sair do campo</span><span>{texto.length}/1000</span>
    </div>
    {erro && <p id={`erro-item-${encodeURIComponent(item.chave || item.id)}`} role="alert">{erro}</p>}
  </div>;
}
