import {textoBemFormado} from '../lib/textoBemFormado.js';
import {collection,doc,getDocFromServer,getDocsFromServer,query,where,orderBy,startAfter,limit,runTransaction,serverTimestamp} from 'firebase/firestore';
import {criarAdminCatalogo} from './adminCatalogo.js';
import {projetarPedido} from './pedidos.js';
// Contratos preservados de pedidoStatusService e pagamentoService (Express).
export const TRANSICOES_STATUS={recebido:['pagamento_confirmado','cancelado','pagamento_recusado'],pagamento_confirmado:['em_preparacao','cancelado'],em_preparacao:['pronto','cancelado'],pronto:['saiu_para_entrega','entregue','cancelado'],saiu_para_entrega:['entregue'],entregue:[],cancelado:[],pagamento_recusado:[]};
export const TRANSICOES_PAGAMENTO={pendente:['confirmado','recusado','cancelado'],confirmado:[],recusado:[],cancelado:[]};
const erro=(message,status=400,code='ADMIN_PEDIDO_INVALIDO')=>Object.assign(new Error(message),{status,code});
const id=v=>{if(typeof v!=='string' || !v || v.length>128 || !textoBemFormado(v) || /[\/\\\u0000-\u001f\u007f-\u009f]/u.test(v) || ['.','..'].includes(v))throw erro('Identificador inválido.');return v;};
export function criarAdminPedidos(contexto){
 const {db,auth,lojaId,invalidar=()=>{}}=contexto,gate=criarAdminCatalogo(contexto);
 async function executar(fn){
  let uid;
  const conferir=()=>{if(!uid || auth.currentUser?.uid!==uid)throw erro('A sessão mudou. Entre novamente.',409,'SESSION_CHANGED');};
  try{uid=(await gate.autorizar()).uid;conferir();const r=await fn({uid,conferir,base:doc(db,'lojas',id(lojaId))});conferir();return r;}
  catch(e){if(e.code==='permission-denied'){invalidar();throw erro('Acesso negado. Atualize o pedido e confira sua sessão.',403);}if(e.status)throw e;throw erro('Não foi possível confirmar a operação. Atualize o pedido antes de tentar novamente.',503,'ADMIN_PEDIDO_INCERTO');}
 }
 function projetar(s){const d=s.data();if(d.lojaId!==lojaId)throw erro('Acesso negado.',403);return {...projetarPedido(d,s.id),revisaoAdministrativa:d.revisaoAdministrativa ?? 0,transicoesStatus:TRANSICOES_STATUS[d.status] || [],transicoesPagamento:d.status==='cancelado'?[]:TRANSICOES_PAGAMENTO[d.pagamento?.status] || [],registroPagamento:d.pagamento?.registroManual?{origem:d.pagamento.registroManual.origem}:null};}
 async function buscar(base,identificador){
  const s=await getDocFromServer(doc(base,'pedidos',id(identificador)));if(!s.exists())throw erro('Pedido não encontrado.',404);const p=projetar(s),d=s.data();
  // Compatibilidade do detalhe original: só usa endereço atual quando falta snapshot legado.
  if(!p.endereco && d.enderecoId && d.clienteId){const e=await getDocFromServer(doc(base,'clientes',id(d.clienteId),'enderecos',id(d.enderecoId)));if(e.exists())p.endereco=projetarPedido({endereco:e.data()},s.id).endereco;}
  return p;
 }
 async function alterar(identificador,tipo,novo,esperado){return executar(async({base,uid,conferir})=>{
  if(!Number.isSafeInteger(esperado) || esperado<0)throw erro('Atualize o pedido antes de confirmar a alteração.',409,'ADMIN_PEDIDO_CONFLITO');
  const ref=doc(base,'pedidos',id(identificador)),evento=doc(collection(ref,'historicoAdministrativo'));
  try{await runTransaction(db,async tx=>{
   conferir();const snap=await tx.get(ref);if(!snap.exists())throw erro('Pedido não encontrado.',404);const d=snap.data();
   if(d.lojaId!==lojaId)throw erro('Acesso negado.',403);
   if((d.revisaoAdministrativa ?? 0)!==esperado)throw erro('O pedido foi alterado por outra operação. Atualize antes de confirmar novamente.',409,'ADMIN_PEDIDO_CONFLITO');
   const anterior=tipo==='status'?d.status:d.pagamento?.status;
   const permitidas=tipo==='status'?TRANSICOES_STATUS[anterior]:d.status==='cancelado'?[]:TRANSICOES_PAGAMENTO[anterior];
   if(!permitidas?.includes(novo))throw erro('Transição não permitida. Atualize o pedido.');
   if(tipo==='status' && ((novo==='pagamento_confirmado' && d.pagamento?.status!=='confirmado') || (novo==='pagamento_recusado' && d.pagamento?.status!=='recusado')))throw erro('Registre explicitamente o pagamento antes de alterar o status operacional.');
   const registro={id:evento.id,tipo,anterior,novo,uid,origem:'manual_estabelecimento',revisao:esperado+1,criadoEm:serverTimestamp()};
   const patch={revisaoAdministrativa:esperado+1,ultimaAlteracaoAdministrativa:registro,atualizadoEm:serverTimestamp()};
   if(tipo==='status')patch.status=novo;else patch.pagamento={...d.pagamento,status:novo,atualizadoEm:serverTimestamp(),registroManual:{uid,origem:'manual_estabelecimento',criadoEm:serverTimestamp()}};
   tx.update(ref,patch);tx.set(evento,registro);
  });}catch(e){
   // Em concorrência, as Rules podem recusar a revisão antiga antes do retry do SDK.
   if(e.code==='permission-denied'){
    const atual=await getDocFromServer(ref);conferir();
    if(atual.exists() && (atual.data().revisaoAdministrativa ?? 0)!==esperado)throw erro('O pedido foi alterado por outra operação. Atualize antes de confirmar novamente.',409,'ADMIN_PEDIDO_CONFLITO');
   }
   throw e;
  }conferir();return buscar(base,identificador);
 });}
 return {
  sessao:gate.sessao,
  buscar:identificador=>executar(({base})=>buscar(base,identificador)),
  listar:(opcoes={})=>executar(async({base})=>{
   if(Object.keys(opcoes).some(k=>!['limite','cursor','status','numeroPedido'].includes(k)))throw erro('Filtro inválido.');
   const n=Number(opcoes.limite || 25);if(!Number.isInteger(n) || n<1 || n>100)throw erro('Limite deve estar entre 1 e 100.');
   const c=collection(base,'pedidos'),f=[];
   if(opcoes.status){if(!Object.hasOwn(TRANSICOES_STATUS,opcoes.status))throw erro('Status inválido.');if(opcoes.numeroPedido===undefined)f.push(where('status','==',opcoes.status));}
   if(opcoes.numeroPedido!==undefined){if(!Number.isSafeInteger(opcoes.numeroPedido) || opcoes.numeroPedido<1 || opcoes.numeroPedido>999999999)throw erro('Número de pedido inválido.');f.push(where('numeroPedido','==',opcoes.numeroPedido));}else f.push(orderBy('criadoEm','desc'));
   if(opcoes.cursor){const cursor=await getDocFromServer(doc(c,id(opcoes.cursor)));if(!cursor.exists())throw erro('Cursor inválido.');f.push(startAfter(cursor));}
   const docs=(await getDocsFromServer(query(c,...f,limit(n+1)))).docs,itens=docs.slice(0,n).map(projetar).filter(p=>!opcoes.status || p.status===opcoes.status);
   return {itens,proximoCursor:docs.length>n?itens.at(-1).id:null};
  }),
  status:(identificador,novo,esperado)=>alterar(identificador,'status',novo,esperado),
  pagamento:(identificador,novo,esperado)=>alterar(identificador,'pagamento',novo,esperado)
 };
}
