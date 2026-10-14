export const moeda = value => Number(value || 0).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
export const quantidadeValida = value => Number.isInteger(value) && value >= 1 && value <= 99;
export function alterarCarrinho(itens, id, quantidade) {
  if (!quantidadeValida(quantidade)) return itens;
  const existe = itens.some(i => i.id === id);
  return existe ? itens.map(i => i.id === id ? {...i, quantidade} : i) : [...itens, {id, quantidade}];
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
      if(typeof id!=='string' || !id.trim() || id.length>128 || !id.isWellFormed() || /[\/\\\u0000-\u001f\u007f-\u009f]/.test(id) || ['.','..'].includes(id) || !quantidadeValida(item.quantidade) || ids.has(id))continue;
      ids.add(id);resultado.push({id,quantidade:item.quantidade});
    }
    return resultado;
  }catch{return [];}
}
