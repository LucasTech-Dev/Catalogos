import {identificadorValido} from '../lib/identificador.js';
import {criarGravadorIncremental} from './pedidoIncremental.js';
import {collection,doc,getDocFromServer,getDocsFromServer,query,where} from 'firebase/firestore';
import {mensagemPedido} from '../lib/whatsappPedido.js';
const falha=(message,status,code)=>Object.assign(new Error(message),{status,code});
const idValido=v=>{if(!identificadorValido(v))throw falha('Identificador inválido.',400);return v;};
const campos=(d,nomes)=>Object.fromEntries(nomes.filter(k=>d?.[k]!==undefined).map(k=>[k,d[k]]));
const endereco=d=>d?campos(d,['id','apelido','rua','logradouro','numero','bairro','cidade','uf','complemento','cep']):null;
export function projetarPedido(d,id) {
  const p=campos(d,['numeroPedido','lojaId','clienteId','enderecoId','observacao','tipoEntrega','status','subtotal','taxaEntrega','desconto','total']);
  p.id=id;p.cliente=d.cliente?campos(d.cliente,['nome','email','telefone']):null;p.endereco=endereco(d.endereco);
  p.pagamento=campos(d.pagamento,['forma','status','valor']);
  if(d.pagamento?.registroManual?.origem==='manual_estabelecimento')p.pagamento.origem='manual_estabelecimento';
  p.itens=Array.isArray(d.itens)?d.itens.map(i=>campos(i,['produtoId','nome','precoUnitario','quantidade','subtotal','observacao'])):[];
  for(const k of ['criadoEm','atualizadoEm'])if(d[k]?.seconds!==undefined)p[k]={_seconds:d[k].seconds,_nanoseconds:d[k].nanoseconds};
  return p;
}
export const CRIACAO_BLOQUEADA='A criação de pedidos está temporariamente indisponível. Seu carrinho foi preservado.';
// A chamada sem contexto autenticado continua fechada. O gravador contextual
// exige revisão comercial habilitada e autorização completa nas Rules.
export async function criarPedido(){throw falha(CRIACAO_BLOQUEADA,503,'PEDIDO_CRIACAO_BLOQUEADA');}
export function criarServicoPedidos({db,auth,sessao,lojaId}) {
  async function executar(fn,expectedUid=auth?.currentUser?.uid){
    try {
      idValido(lojaId);if(!db)throw falha('Pedidos não configurados.',503);
      const user=await sessao();if(!user?.uid)throw falha('Entre na sua conta para continuar.',401);const uid=user.uid;
      const conferir=()=>{if(auth.currentUser?.uid!==uid || expectedUid && expectedUid!==uid)throw falha('A sessão mudou. Entre novamente.',409,'SESSION_CHANGED');};
      conferir();const resultado=await fn({uid,conferir,base:doc(db,'lojas',lojaId)});conferir();return resultado;
    }catch(e){if(e.status)throw e;if(e.code==='permission-denied')throw falha('Acesso negado.',403);throw falha('Não foi possível consultar seus pedidos. Verifique sua conexão e tente novamente.',503);}
  }
  async function buscar(base,uid,id){
    const snap=await getDocFromServer(doc(base,'pedidos',idValido(id)));
    if(!snap.exists())throw falha('Pedido não encontrado.',404);
    const p=snap.data();if(p.clienteId!==uid || p.lojaId!==lojaId)throw falha('Acesso negado.',403);
    return projetarPedido(p,snap.id);
  }
  return {
    criarPedido:criarGravadorIncremental({db,auth,sessao,lojaId,bloqueio:CRIACAO_BLOQUEADA,projetar:projetarPedido}),
    listarPedidos:()=>executar(async({base,uid})=>{const lista=await getDocsFromServer(query(collection(base,'pedidos'),where('clienteId','==',uid),where('lojaId','==',lojaId)));return lista.docs.map(d=>projetarPedido(d.data(),d.id));}),
    buscarPedido:(id,expectedUid)=>executar(({base,uid})=>buscar(base,uid,id),expectedUid),
    finalizarPedido:(id,expectedUid)=>executar(async({base,uid,conferir})=>{const pedido=await buscar(base,uid,id);conferir();const loja=await getDocFromServer(doc(db,'catalogosPublicos',lojaId));if(!loja.exists() || loja.data().ativo!==true)throw falha('Loja indisponível.',404);return mensagemPedido(loja.data(),pedido);},expectedUid),
    recuperarPedido:(chave,expectedUid)=>executar(async({base,uid,conferir})=>{
      if(typeof chave!=='string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(chave))throw falha('Chave de tentativa inválida.',400);
      const hash=Array.from(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(uid+':'+chave)))).map(v=>v.toString(16).padStart(2,'0')).join('');
      conferir();const snap=await getDocFromServer(doc(base,'idempotencia',hash));if(!snap.exists())throw falha('Pedido não encontrado.',404);
      conferir();return buscar(base,uid,snap.data().pedidoId);
    },expectedUid)
  };
}
