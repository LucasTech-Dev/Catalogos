import {textoBemFormado} from './textoBemFormado.js';
export const moeda = value => Number(value || 0).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
export const quantidadeValida = value => Number.isInteger(value) && value >= 1 && value <= 99;
export const chaveItem = item => item.observacao ? JSON.stringify([item.id,item.observacao]) : item.id;
export function alterarCarrinho(itens, id, quantidade, observacao) {
  if (!quantidadeValida(quantidade)) return itens;
  const item={id,quantidade,...(observacao?{observacao}:{})},chave=chaveItem(item);
  const existe=itens.some(i=>chaveItem(i)===chave);
  return existe?itens.map(i=>chaveItem(i)===chave?{...i,quantidade}:i):[...itens,item];
}
export function urlWhatsapp(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'wa.me' || url.port || url.username || url.password || !/^\/\d{12,15}$/.test(url.pathname)) throw new Error('URL WhatsApp inválida.');
  return url.href;
}

export function horariosTexto(horarios) {
  if (typeof horarios === 'string') return horarios;
  if (!horarios || typeof horarios !== 'object') return 'Consulte a loja';
  return Object.entries(horarios).map(([dia,horario]) => `${dia}: ${typeof horario === 'string' ? horario : horario?.fechado === true ? 'Fechado' : [horario?.abertura,horario?.fechamento].filter(Boolean).join(' às ') || 'Consulte a loja'}`).join(' • ');
}

// Cache local pode conter entradas antigas/corrompidas. Preservar apenas o contrato mínimo.
export function carregarCarrinho(value) {
  try {
    const itens=JSON.parse(value || '[]');if(!Array.isArray(itens))return [];
    const ids=new Set(),resultado=[];
    for(const item of itens) {
      const id=item?.id;
      if(typeof id!=='string' || !id.trim() || id.length>128 || !textoBemFormado(id) || /[\/\\\u0000-\u001f\u007f-\u009f]/.test(id) || ['.','..'].includes(id) || !quantidadeValida(item.quantidade) || (item.observacao!==undefined && (typeof item.observacao!=='string' || item.observacao.length>1000)) || ids.has(chaveItem(item)))continue;
      ids.add(chaveItem(item));resultado.push({id,quantidade:item.quantidade,...(item.observacao?{observacao:item.observacao}:{})});
    }
    return resultado;
  }catch{return [];}
}

// O contrato de pedidos aceita uma linha por produto e uma observação geral.
export function compraDoCarrinho(itens,observacao='') {
  const agrupados=new Map(),notas=[];
  for(const item of itens){
    const anterior=agrupados.get(item.id);
    agrupados.set(item.id,{...item,quantidade:(anterior?.quantidade || 0)+item.quantidade});
    if(item.observacao)notas.push(`${item.quantidade}x ${item.nome}: ${item.observacao}`);
  }
  return {itens:[...agrupados.values()],observacao:[observacao,...notas].filter(Boolean).join('\n')};
}
