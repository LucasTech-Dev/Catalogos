import {numeroPedido} from './numeroPedido.js';
// Apresentação e filtro apenas dos pedidos que o serviço já carregou para a sessão.
const estados={
 recebido:['Recebido','neutral'],pagamento_confirmado:['Pagamento confirmado','confirmed'],
 em_preparacao:['Em preparação','preparing'],pronto:['Pronto','confirmed'],
 saiu_para_entrega:['Saiu para entrega','preparing'],entregue:['Entregue','delivered'],
 cancelado:['Cancelado','cancelled'],pagamento_recusado:['Pagamento recusado','cancelled']
};
export function statusPedido(status){const [nome,classe]=estados[status]||[String(status||'Status não informado').replaceAll('_',' '),'neutral'];return {nome,classe};}
export function dataPedido(pedido){
 const segundos=pedido.criadoEm?._seconds ?? pedido.criadoEm?.seconds;
 if(typeof segundos!=='number'||!Number.isFinite(segundos))return '';
 const data=new Date(segundos*1000);if(Number.isNaN(data.getTime()))return '';
 return data.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
const normalizar=valor=>String(valor||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
export function filtrarPedidos(pedidos,consulta='',status=''){
 const exato=/^#?([1-9][0-9]{0,8})$/.exec(String(consulta).trim())?.[1];
 const termos=normalizar(consulta).replace(/^#/,'').split(/\s+/).filter(Boolean);
 return pedidos.filter(p=>{
  if(status&&p.status!==status)return false;
  if(exato)return numeroPedido(p)===exato;
  const texto=normalizar([numeroPedido(p),p.id,...(p.itens||[]).map(i=>i.nome),p.status,statusPedido(p.status).nome,dataPedido(p)].join(' '));
  return termos.every(termo=>texto.includes(termo));
 });
}
