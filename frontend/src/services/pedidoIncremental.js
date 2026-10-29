import {identificadorValido} from '../lib/identificador.js';
import {doc,getDocFromServer,runTransaction,Timestamp,serverTimestamp} from 'firebase/firestore';
import {validarPerfil,validarEndereco} from './perfil.js';
const falha=(message,status=409,code='COMPRA_CONFLITO')=>Object.assign(new Error(message),{status,code});
const canonico=v=>Array.isArray(v)?v.map(canonico):v && typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonico(v[k])])):v;
const iguais=(a,b)=>JSON.stringify(canonico(a))===JSON.stringify(canonico(b));
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(v=>v.toString(16).padStart(2,'0')).join('');
const id=identificadorValido;
// Integrado somente após o gate local; a ausência da revisão mantém a loja bloqueada.
export function criarGravadorIncremental({db,auth,sessao,lojaId,bloqueio,projetar}) {
 const executar=async function criarPedido(dados,{chave,expectedUid,endereco}={}) {
  if(!db || !id(lojaId))throw falha(bloqueio,503,'PEDIDO_CRIACAO_BLOQUEADA');
  const user=await sessao();if(!user?.uid)throw falha('Entre na sua conta para continuar.',401);const uid=user.uid;
  const conferir=()=>{if(auth.currentUser?.uid!==uid || expectedUid && expectedUid!==uid)throw falha('A sessão mudou. Entre novamente.',409,'SESSION_CHANGED');};
  conferir();
  if(typeof chave!=='string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(chave))throw falha('Chave de tentativa inválida.',400);
  const controle=doc(db,'lojas',lojaId,'controleCompra','versao');
  const rev=await getDocFromServer(controle);conferir();
  if(!rev.exists())throw falha(bloqueio,503,'PEDIDO_CRIACAO_BLOQUEADA');
  if(!dados || Object.keys(dados).some(k=>!['itens','tipoEntrega','pagamento','cliente','observacao','enderecoId'].includes(k)))throw falha('Dados de pedido inválidos.',400);
  const marcador=await hash(uid+':'+chave);
  const bruto=JSON.parse(JSON.stringify(dados));
  const assinatura=await hash(JSON.stringify(canonico({dados:bruto,endereco:endereco || null})));
  conferir();
  const tentativaRef=doc(db,'lojas',lojaId,'clientes',uid,'tentativasCompra',chave);
  const pedidoRef=doc(db,'lojas',lojaId,'pedidos',marcador),nonceRef=doc(db,'lojas',lojaId,'idempotencia',marcador);
  async function confirmado() {
   const nonce=await getDocFromServer(nonceRef);conferir();
   if(!nonce.exists())return null;
   if(nonce.data().assinatura!==assinatura || nonce.data().pedidoId!==marcador)throw falha('Chave já utilizada para outro pedido.');
   const p=await getDocFromServer(pedidoRef);conferir();
   if(!p.exists() || p.metadata.fromCache || p.metadata.hasPendingWrites || p.data().clienteId!==uid || p.data().lojaId!==lojaId)throw falha('Não foi possível confirmar o pedido.',503,'COMPRA_INCERTA');
   return projetar(p.data(),p.id);
  }
  const recuperado=await confirmado();if(recuperado)return recuperado;
  let tentativa=await getDocFromServer(tentativaRef);conferir();
  if(tentativa.exists() && tentativa.data().assinatura!==assinatura)throw falha('Chave já utilizada para outro pedido.');
  if(!tentativa.exists()){
   validarPerfil(dados.cliente);
   if(!Array.isArray(dados.itens) || !dados.itens.length || dados.itens.length>50 || dados.itens.some(i=>!id(i.produtoId) || !Number.isInteger(i.quantidade) || i.quantidade<1 || i.quantidade>99))throw falha('Revise os itens do pedido.',400);
   const ids=new Set(dados.itens.map(i=>i.produtoId));if(ids.size!==dados.itens.length || dados.itens.reduce((s,i)=>s+i.quantidade,0)>500)throw falha('Revise os itens do pedido.',400);
   let enderecoId=dados.enderecoId || null;
   if(dados.tipoEntrega==='entrega' && !enderecoId && endereco){
    const validado=validarEndereco(endereco);enderecoId='checkout-'+marcador;
    const ref=doc(db,'lojas',lojaId,'clientes',uid,'enderecos',enderecoId);
    await runTransaction(db,async tx=>{conferir();const atual=await tx.get(ref);if(atual.exists() && !iguais(atual.data(),validado))throw falha('Endereço da tentativa foi alterado.');if(!atual.exists())tx.set(ref,validado);});
   }
   const intencao={itens:dados.itens.map(i=>({produtoId:i.produtoId,quantidade:i.quantidade})),tipoEntrega:dados.tipoEntrega,pagamento:dados.pagamento,cliente:dados.cliente,observacao:dados.observacao || '',enderecoId};
   await runTransaction(db,async tx=>{
    const [atual,v]=await Promise.all([tx.get(tentativaRef),tx.get(controle)]);conferir();
    if(atual.exists()){if(atual.data().assinatura!==assinatura || !iguais(atual.data().dados,intencao))throw falha('Chave já utilizada para outro pedido.');return;}
    if(!v.exists())throw falha(bloqueio,503,'PEDIDO_CRIACAO_BLOQUEADA');
    tx.set(tentativaRef,{lojaId,clienteId:uid,revisao:v.data().revisao,dados:intencao,marcador,assinatura,itens:[],ids:[],unidades:0,centavos:0,estado:'aberta',criadoEm:serverTimestamp(),expiraEm:Timestamp.fromMillis(Date.now()+14*60*1000)});
   });
  }
  // Apenas a transação do SDK pode ser repetida. Cada item é lido por índice
  // do estado persistido; não reenviar uma inclusão a partir do estado local.
  try {
   for(let n=0;n<50;n++){
    const terminou=await runTransaction(db,async tx=>{
     const [s,pronto]=await Promise.all([tx.get(tentativaRef),tx.get(pedidoRef)]);conferir();
     if(pronto.exists())return true;
     const a=s.data();if(a.assinatura!==assinatura)throw falha('Chave já utilizada para outro pedido.');
     if(a.estado!=='aberta' || a.expiraEm.toMillis()<=Date.now())throw falha('A tentativa expirou ou foi encerrada. Revise o carrinho.',409,'COMPRA_EXPIRADA');
     const entrada=a.dados.itens[a.itens.length];if(!entrada)return true;
     const produto=await tx.get(doc(db,'catalogosPublicos',lojaId,'produtos',entrada.produtoId));conferir();
     if(!produto.exists())throw falha('Produto indisponível. Revise o carrinho.');
     const p=produto.data(),pc=Math.round(p.preco*100),q=entrada.quantidade;
     const item={produtoId:entrada.produtoId,nome:p.nome,precoUnitario:pc/100,quantidade:q,subtotal:pc*q/100};
     tx.update(tentativaRef,{itens:[...a.itens,item],ids:[...a.ids,entrada.produtoId],unidades:a.unidades+q,centavos:a.centavos+pc*q});return false;
    });
    if(terminou)break;
   }
   let ultimoLido;
   const contadorRef=doc(db,'lojas',lojaId,'contadores','pedidos');
   const concluir=()=>runTransaction(db,async tx=>{
    const [s,pronto,loja,contador]=await Promise.all([tx.get(tentativaRef),tx.get(pedidoRef),tx.get(doc(db,'catalogosPublicos',lojaId)),tx.get(contadorRef)]);conferir();
    if(pronto.exists())return;
    const ultimo=contador.exists()?contador.data().ultimo:0;ultimoLido=ultimo;
    if(!Number.isSafeInteger(ultimo) || ultimo<0 || ultimo>=999999999)throw falha('Numeração de pedidos indisponível. Contate a loja.',503,'NUMERACAO_INDISPONIVEL');
    const numeroPedido=ultimo+1;
    const reservaRef=doc(db,'lojas',lojaId,'numerosPedidos',String(numeroPedido));
    const a=s.data(),d=a.dados,l=loja.data();let enderecoSnapshot=null;
    if(d.tipoEntrega==='entrega'){
     if(!id(d.enderecoId))throw falha('Informe um endereço completo.',400);
     const e=await tx.get(doc(db,'lojas',lojaId,'clientes',uid,'enderecos',d.enderecoId));
     if(!e.exists())throw falha('Endereço não encontrado.',400);enderecoSnapshot={...e.data(),id:e.id};
    }
    conferir();const taxa=d.tipoEntrega==='entrega'?Math.round(Number(l?.entrega?.taxa)*100):0;
    const total=(a.centavos+taxa)/100;
    tx.set(pedidoRef,{numeroPedido,lojaId,clienteId:uid,enderecoId:d.enderecoId,endereco:enderecoSnapshot,itens:a.itens,subtotal:a.centavos/100,taxaEntrega:taxa/100,desconto:0,total,pagamento:{forma:d.pagamento.forma,status:'pendente',valor:total},observacao:d.observacao,tipoEntrega:d.tipoEntrega,status:'recebido',cliente:d.cliente,criadoEm:serverTimestamp(),atualizadoEm:serverTimestamp(),operacaoCompra:chave});
    tx.set(nonceRef,{clienteId:uid,lojaId,pedidoId:marcador,assinatura});
    tx.set(contadorRef,{ultimo:numeroPedido});
    tx.set(reservaRef,{numeroPedido,pedidoId:marcador,clienteId:uid});
   });
   // Rules podem recusar a revisão vencida antes do retry nativo do SDK.
   // Retentar somente quando outra compra comprovadamente avançou o contador.
   for(let corrida=0;corrida<5;corrida++){
    try{await concluir();break;}catch(e){
     if(e.code!=='permission-denied' || corrida===4)throw e;
     const pronto=await confirmado();if(pronto)return pronto;
     const atual=await getDocFromServer(contadorRef);conferir();
     if(!atual.exists() || !(atual.data().ultimo>ultimoLido))throw e;
    }
   }
  } catch(e) {
   // Não gerar outra chave nem repetir o envio após falha de transporte.
   // Consultar o marcador original; se a consulta falhar, resultado incerto.
   try {const p=await confirmado();if(p)return p;}catch(consulta){if(consulta.code==='SESSION_CHANGED' || consulta.code==='COMPRA_CONFLITO')throw consulta;throw falha('Não foi possível confirmar o envio. Retome a mesma tentativa quando houver conexão.',503,'COMPRA_INCERTA');}
   if(e.code==='permission-denied' || e.code==='COMPRA_EXPIRADA'){
    // Encerrar no servidor antes de permitir outra chave. Isso impede que um
    // segundo separador finalize esta tentativa enquanto o usuário a reinicia.
    await runTransaction(db,async tx=>{
     const [s,p]=await Promise.all([tx.get(tentativaRef),tx.get(pedidoRef)]);conferir();
     if(p.exists())return;
     if(s.exists() && s.data().estado==='aberta')tx.update(tentativaRef,{estado:'abandonada'});
    });
    const p=await confirmado();if(p)return p;
    throw falha('A tentativa foi encerrada. Revise os dados comerciais e confirme novamente. Seu carrinho foi preservado.',400,'COMPRA_REVISAR');
   }
   throw e;
  }
  const p=await confirmado();if(!p)throw falha('Não foi possível confirmar o pedido. Retome a mesma tentativa.',503,'COMPRA_INCERTA');return p;
 };
 return async (...args)=>{
  try {return await executar(...args);}catch(e){
   if(e.status)throw e;
   if(e.code==='permission-denied')throw falha('A operação foi recusada. Seus dados foram preservados.',403,'COMPRA_RECUSADA');
   throw falha('Não foi possível confirmar o envio. Retome a mesma tentativa quando houver conexão.',503,'COMPRA_INCERTA');
  }
 };
}
