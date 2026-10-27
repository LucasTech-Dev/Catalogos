import {auth,db,sessaoExistente} from '../lib/firebase';
import {criarAdminPedidos} from './adminPedidos';
import {criarAdminCatalogo} from './adminCatalogo';
import {criarAdminGestao} from './adminGestao';
import {lojaId} from './api';
export const adminBase=`/admin/lojas/${encodeURIComponent(lojaId)}`;
const contexto={db,auth,sessaoExistente,lojaId,invalidar:()=>window.dispatchEvent(new Event('admin:sessao-invalida'))};
const catalogo=criarAdminCatalogo(contexto),pedidos=criarAdminPedidos(contexto),gestao=criarAdminGestao(contexto);
const foraDoEscopo=()=>Promise.reject(new Error('Operação administrativa não prevista.'));
export const admin={
 sessao:gestao.sessao,loja:gestao.loja,dashboard:gestao.dashboard,configurar:gestao.configurar,
 listar:(nome,opcoes={})=>nome==='pedidos'?pedidos.listar(opcoes):nome==='clientes'?gestao.listarClientes(opcoes):catalogo.listar(nome,opcoes),
 buscar:(nome,id)=>nome==='pedidos'?pedidos.buscar(id):nome==='clientes'?gestao.buscarCliente(id):catalogo.buscar(nome,id),
 salvar:(nome,id,dados,criacaoId)=>['produtos','categorias'].includes(nome)?catalogo.salvar(nome,id,dados,criacaoId):foraDoEscopo(),
 excluir:(nome,id)=>['produtos','categorias'].includes(nome)?catalogo.excluir(nome,id):foraDoEscopo(),
 historicoPedido:pedidos.historico,status:pedidos.status,pagamento:pedidos.pagamento
};
export const rotulosStatus={recebido:'Recebido',pagamento_confirmado:'Pagamento confirmado',pagamento_recusado:'Pagamento recusado',em_preparacao:'Em preparação',pronto:'Pronto',saiu_para_entrega:'Saiu para entrega',entregue:'Entregue',cancelado:'Cancelado'};
export const dataTexto=value=>{const data=value?._seconds?new Date(value._seconds*1000):value?new Date(value):null;return data && Number.isFinite(data.getTime())?data.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}):'Não informado';};
export const classeStatus={recebido:'received',pagamento_confirmado:'received',em_preparacao:'preparing',pronto:'ready',saiu_para_entrega:'preparing',entregue:'delivered'};
