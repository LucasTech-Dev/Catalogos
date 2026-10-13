import {api,lojaId,pedidos} from './api';
export const adminBase=`/admin/lojas/${encodeURIComponent(lojaId)}`;
const chamar=(path,options={})=>api(path,{...options,administrativo:true});
export const admin={
  sessao:()=>chamar(adminBase+'/sessao'),loja:()=>chamar(adminBase+'/loja'),
  dashboard:periodo=>chamar(adminBase+'/dashboard?'+new URLSearchParams(periodo)),
  listar:(nome,options={})=>chamar((nome==='pedidos'?pedidos:adminBase+'/'+nome)+'?'+new URLSearchParams({limite:25,...options})),
  buscar:(nome,id)=>chamar(adminBase+'/'+nome+'/'+encodeURIComponent(id)),
  salvar:(nome,id,body)=>chamar(adminBase+'/'+nome+(id?'/'+encodeURIComponent(id):''),{method:id?'PATCH':'POST',body}),
  excluir:(nome,id)=>chamar(adminBase+'/'+nome+'/'+encodeURIComponent(id),{method:'DELETE'}),
  configurar:body=>chamar(adminBase+'/loja',{method:'PATCH',body}),
  status:(id,status)=>chamar(pedidos+'/'+encodeURIComponent(id)+'/status',{method:'PATCH',body:{status}}),
  pagamento:(id,status)=>chamar(pedidos+'/'+encodeURIComponent(id)+'/pagamento',{method:'PATCH',body:{status}})
};
export const rotulosStatus={recebido:'Recebido',pagamento_confirmado:'Pagamento confirmado',pagamento_recusado:'Pagamento recusado',em_preparacao:'Em preparação',pronto:'Pronto',saiu_para_entrega:'Saiu para entrega',entregue:'Entregue',cancelado:'Cancelado'};
export const dataTexto=value=>{const data=value?._seconds?new Date(value._seconds*1000):value?new Date(value):null;return data && Number.isFinite(data.getTime())?data.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}):'Não informado';};
export const classeStatus={recebido:'received',pagamento_confirmado:'received',em_preparacao:'preparing',pronto:'ready',saiu_para_entrega:'preparing',entregue:'delivered'};
