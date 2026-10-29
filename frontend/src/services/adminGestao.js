import {identificadorValido} from '../lib/identificador.js';
import {textoBemFormado} from '../lib/textoBemFormado.js';
import {collection,doc,getDocFromServer,getDocsFromServer,getCountFromServer,getAggregateFromServer,sum,query,where,orderBy,documentId,startAfter,limit} from 'firebase/firestore';
import {criarAdminCatalogo} from './adminCatalogo.js';
import {salvarComProjecao} from './projecaoPublica.js';
import {projetarPedido} from './pedidos.js';
import {TRANSICOES_STATUS} from './adminPedidos.js';
const falha=(message,status=400)=>Object.assign(new Error(message),{status});
const id=v=>{if(!identificadorValido(v))throw falha('Identificador inválido.');return v;};
const selecionar=(d,nomes)=>Object.fromEntries(nomes.filter(k=>typeof d?.[k]===({pedidoMinimo:'number',anonimo:'boolean',fechado:'boolean'}[k] || 'string') && (typeof d[k]!=='number' || Number.isFinite(d[k]))).map(k=>[k,d[k]]));
const DIAS=['segunda','terca','quarta','quinta','sexta','sabado','domingo'];
export const CAMPOS_LOJA=['nome','descricao','telefone','whatsapp','instagram','endereco','horarios','logo','imagem','corPrimaria','tempoMedio','pagamentos','entrega','retirada','pedidoMinimo'];
function campos(d,permitidos){if(!d || typeof d!=='object' || Array.isArray(d) || Object.keys(d).some(k=>!permitidos.includes(k)))throw falha('Campo não permitido nesta operação.');}
function texto(v,max=200,obrigatorio=false,multilinha=false){if(typeof v!=='string' || !textoBemFormado(v) || v.length>max || obrigatorio && !v.trim() || /[\u007f-\u009f]/u.test(v) || (multilinha?/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u:/[\u0000-\u001f]/u).test(v))throw falha('Texto inválido.');return v.trim();}
function dinheiro(v){const c=v*100;if(typeof v!=='number' || !Number.isFinite(v) || v<0 || v>1000000 || Math.abs(c-Math.round(c))>Number.EPSILON*Math.max(1,Math.abs(c))*4)throw falha('Valor deve ter até duas casas decimais.');return Math.round(c)/100;}
function booleano(v){if(typeof v!=='boolean')throw falha('Informe verdadeiro ou falso.');return v;}
function telefone(v,opcional=false){const t=texto(v,25,!opcional),n=t.replace(/\D/g,'');if(opcional && !t)return t;if(!/^\+?[\d ()-]+$/.test(t) || n.length<10 || n.length>15 || /^0+$/.test(n))throw falha('Telefone inválido.');return t;}
export function validarLojaPatch(d){
 campos(d,CAMPOS_LOJA);if(!Object.keys(d).length)throw falha('Informe os campos a atualizar.');const r={...d};
 for(const k of ['nome','descricao','instagram','tempoMedio'])if(r[k]!==undefined)r[k]=texto(r[k],k==='descricao'?2000:200,k==='nome',k==='descricao');
 if(r.telefone!==undefined)r.telefone=telefone(r.telefone,true);
 if(r.whatsapp!==undefined){let n=telefone(r.whatsapp).replace(/\D/g,'');if(n.startsWith('00'))n=n.slice(2);if([10,11].includes(n.length))n='55'+n;if(n.length<12 || n.length>15 || /^0+$/.test(n))throw falha('WhatsApp inválido.');r.whatsapp=n;}
 for(const k of ['logo','imagem'])if(r[k]!==undefined && r[k]!==''){try{const u=new URL(texto(r[k],2048));if(!['http:','https:'].includes(u.protocol) || u.username || u.password)throw Error();r[k]=u.href;}catch{throw falha('Imagem deve ser URL HTTP ou HTTPS válida.');}}
 if(r.corPrimaria!==undefined && (typeof r.corPrimaria!=='string' || !/^#[\da-f]{6}$/i.test(r.corPrimaria)))throw falha('Cor inválida.');
 if(r.endereco!==undefined){if(typeof r.endereco==='string')r.endereco=texto(r.endereco,1000);else{campos(r.endereco,['rua','logradouro','numero','bairro','cidade','uf','cep','complemento']);r.endereco=Object.fromEntries(Object.entries(r.endereco).map(([k,v])=>{let t=texto(v,k==='uf'?2:k==='cep'?9:200);if(k==='uf'){t=t.toUpperCase();if(t && !'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').includes(t))throw falha('UF inválida.');}if(k==='cep' && t && !/^\d{5}-?\d{3}$/.test(t))throw falha('CEP inválido.');return [k,t];}));}}
 if(r.horarios!==undefined){campos(r.horarios,DIAS);r.horarios=Object.fromEntries(Object.entries(r.horarios).map(([dia,h])=>{campos(h,['abertura','fechamento','fechado']);if(!Object.keys(h).length)throw falha('Informe horário.');const novo={...h};if(h.fechado!==undefined)booleano(h.fechado);for(const k of ['abertura','fechamento'])if(h[k]!==undefined && (typeof h[k]!=='string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(h[k])))throw falha('Horário inválido.');return [dia,novo];}));}
 for(const k of ['pagamentos','entrega','retirada'])if(r[k]!==undefined){campos(r[k],k==='pagamentos'?['pix','dinheiro','cartao_credito','cartao_debito']:k==='entrega'?['habilitada','taxa']:['habilitada']);if(!Object.keys(r[k]).length)throw falha('Configuração vazia.');r[k]={...r[k]};for(const [f,v] of Object.entries(r[k]))r[k][f]=f==='taxa'?dinheiro(v):booleano(v);}
 if(r.pedidoMinimo!==undefined)r.pedidoMinimo=dinheiro(r.pedidoMinimo);return r;
}
function prepararLoja(atual,patch){
 const r={...patch};
 for(const k of ['pagamentos','entrega','retirada','endereco','horarios'])if(r[k] && typeof r[k]==='object'){
  r[k]={...(typeof atual[k]==='object'?atual[k]:{}),...r[k]};
  if(k==='horarios')for(const dia of Object.keys(patch.horarios)){r.horarios[dia]={...(typeof atual.horarios?.[dia]==='object'?atual.horarios[dia]:{}),...patch.horarios[dia]};const h=r.horarios[dia];if(h.fechado!==true && (!h.abertura || !h.fechamento || h.abertura===h.fechamento))throw falha('Informe abertura e fechamento diferentes.');}
 }
 if(patch.pagamentos && atual.pagamentos?.cartao===true){for(const f of ['cartao_credito','cartao_debito'])r.pagamentos[f]=patch.pagamentos[f] ?? true;r.pagamentos.cartao=false;}
 const n={...atual,...r};
 if(n.entrega?.habilitada===false && n.retirada?.habilitada===false)throw falha('Habilite entrega ou retirada.');
 if(n.entrega?.habilitada===true)dinheiro(n.entrega.taxa ?? n.taxaEntrega);
 if(patch.pagamentos && !['pix','dinheiro','cartao_credito','cartao_debito'].some(f=>n.pagamentos[f]===true))throw falha('Habilite ao menos uma forma de pagamento.');return r;
}
function cliente(s){const d=s.data(),r={id:s.id,...selecionar(d,['nome','email','telefone','anonimo'])};for(const k of ['criadoEm','atualizadoEm'])if(d[k]?.seconds!==undefined)r[k]={_seconds:d[k].seconds,_nanoseconds:d[k].nanoseconds};return r;}
function loja(s){const d=s.data(),r={id:s.id,...selecionar(d,['nome','descricao','telefone','whatsapp','corPrimaria','tempoMedio','instagram','pedidoMinimo','logo','imagem'])};r.endereco=typeof d.endereco==='string'?d.endereco:selecionar(d.endereco,['id','apelido','rua','logradouro','numero','bairro','cidade','uf','complemento','cep']);const h=d.horarios || d.horarioFuncionamento;r.horarios=typeof h==='string'?h:Object.fromEntries(Object.entries(h || {}).filter(([dia])=>[...DIAS,'terça','sábado'].includes(dia)).map(([dia,v])=>[dia,typeof v==='string'?v:selecionar(v,['abertura','fechamento','fechado'])]));r.pagamentos=Object.fromEntries(['pix','dinheiro','cartao_credito','cartao_debito'].map(f=>[f,d.pagamentos?.[f]===true || f.startsWith('cartao_') && d.pagamentos?.cartao===true]));r.entrega={habilitada:d.entrega?.habilitada===true,taxa:Number.isFinite(d.entrega?.taxa ?? d.taxaEntrega) && (d.entrega?.taxa ?? d.taxaEntrega)>=0?(d.entrega?.taxa ?? d.taxaEntrega):null};r.retirada={habilitada:d.retirada?.habilitada!==false};return r;}
export function periodoGestao(opcoes={}){
 campos(opcoes,['inicio','fim']);const hoje=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),inicio=opcoes.inicio || hoje,fim=opcoes.fim || inicio;
 const data=v=>{if(typeof v!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(v))throw falha('Data inválida.');const d=new Date(v+'T00:00:00-03:00');if(!Number.isFinite(d.getTime()) || d.toISOString().slice(0,10)!==v)throw falha('Data inválida.');return d;};const de=data(inicio),ate=data(fim);ate.setUTCDate(ate.getUTCDate()+1);if(ate<=de || ate-de>31*86400000)throw falha('Selecione um período de até31 dias.');return {inicio,fim,de,ate};
}
export function criarAdminGestao(contexto){
 const {db,auth,lojaId,invalidar=()=>{}}=contexto,gate=criarAdminCatalogo(contexto);
 async function executar(fn){try{const {uid}=await gate.autorizar(),conferir=()=>{if(auth.currentUser?.uid!==uid)throw falha('A sessão mudou. Entre novamente.',409);};conferir();const r=await fn({base:doc(db,'lojas',id(lojaId)),conferir});conferir();return r;}catch(e){if(e.code==='permission-denied'){const u=auth.currentUser;try{await gate.autorizar();if(auth.currentUser?.uid===u?.uid){const limite=e.message?.includes('maximum of 1000 expressions');throw Object.assign(falha(limite?'Não foi possível salvar todos os horários de uma vez. Nenhuma alteração foi aplicada e seu formulário foi preservado.':'Alteração recusada pelas regras. Confira os dados antes de tentar novamente.',409),{code:limite?'B04_LIMITE_CONFIG':'ADMIN_GESTAO_CONFLITO'});}}catch(x){if(x.status===409)throw x;}invalidar();throw falha('Acesso negado.',403);}if(e.status)throw e;throw falha('Não foi possível confirmar a operação. Confira a conexão e atualize os dados.',503);}}
 const buscarLoja=async base=>{const s=await getDocFromServer(base);if(!s.exists())throw falha('Loja não encontrada.',404);return loja(s);};
 async function configurar(dados,{base,conferir}) {
  const patch=validarLojaPatch(dados);
  const salvar=p=>salvarComProjecao(db,lojaId,'loja',null,p,{modo:'editar',conferir,preparar:prepararLoja});
  const dias=DIAS.filter(d=>Object.hasOwn(patch.horarios || {},d));
  if(dias.length<=1){await salvar(patch);return buscarLoja(base);}
  // Validar todo o formulário antes da primeira escrita. Cada transação volta a
  // ler/validar a origem e a revisão, inclusive quando o SDK repete o callback.
  const atual=await getDocFromServer(base);conferir();
  if(!atual.exists())throw falha('Loja não encontrada.',404);
  prepararLoja(atual.data(),patch);
  const {horarios,...outros}=patch,diasConfirmados=[],gruposConfirmados=[];
  // Entrega/retirada e pagamentos precisam manter seus vínculos comerciais.
  // Identidade e endereço não precisam compartilhar a mesma transação.
  const grupos=[
   ['identidade',Object.fromEntries(Object.entries(outros).filter(([k])=>!['endereco','pagamentos','entrega','retirada','pedidoMinimo'].includes(k)))],
   ['endereço',Object.hasOwn(outros,'endereco')?{endereco:outros.endereco}:{}],
   ['pagamentos',Object.hasOwn(outros,'pagamentos')?{pagamentos:outros.pagamentos}:{}],
   ['entrega e retirada',Object.fromEntries(Object.entries(outros).filter(([k])=>['entrega','retirada','pedidoMinimo'].includes(k)))]
  ].filter(([,p])=>Object.keys(p).length);
  let outrosConfirmados=grupos.length===0;
  try {
   for(const dia of dias){conferir();await salvar({horarios:{[dia]:horarios[dia]}});diasConfirmados.push(dia);}
   for(const [nome,p] of grupos){conferir();await salvar(p);gruposConfirmados.push(nome);}
   outrosConfirmados=true;
   const resultado=await buscarLoja(base);conferir();
   return {...resultado,salvamento:{atomico:false,diasConfirmados,gruposConfirmados,outrosConfirmados}};
  }catch(e){
   // Não desfazer gravações confirmadas: isso poderia apagar alterações de outro
   // administrador. Falha de rede pode deixar a última transação sem confirmação.
   throw Object.assign(falha(`Salvamento em etapas interrompido. Dias confirmados: ${diasConfirmados.join(', ') || 'nenhum'}. Grupos de configurações confirmados: ${gruposConfirmados.join(', ') || 'nenhum'}. Outras configurações: ${outrosConfirmados?'confirmadas':'não confirmadas integralmente'}. Recarregue para conferir o estado atual antes de tentar novamente; seu formulário foi preservado.`,409),{
    code:'ADMIN_CONFIG_ETAPAS',salvamento:{atomico:false,diasConfirmados:[...diasConfirmados],diasNaoConfirmados:dias.filter(d=>!diasConfirmados.includes(d)),gruposConfirmados:[...gruposConfirmados],outrosConfirmados},cause:e
   });
  }
 }
 return {
  sessao:gate.sessao,loja:()=>executar(({base})=>buscarLoja(base)),
  configurar:dados=>executar(ctx=>configurar(dados,ctx)),
  buscarCliente:identificador=>executar(async({base})=>{const s=await getDocFromServer(doc(base,'clientes',id(identificador)));if(!s.exists())throw falha('Registro não encontrado.',404);return cliente(s);}),
  listarClientes:(opcoes={})=>executar(async({base})=>{campos(opcoes,['limite','cursor']);const n=Number(opcoes.limite || 25);if(!Number.isInteger(n) || n<1 || n>100)throw falha('Limite deve estar entre1 e100.');const c=collection(base,'clientes'),f=[orderBy(documentId())];if(opcoes.cursor){const s=await getDocFromServer(doc(c,id(opcoes.cursor)));if(!s.exists())throw falha('Cursor inválido.');f.push(startAfter(s));}const docs=(await getDocsFromServer(query(c,...f,limit(n+1)))).docs,itens=docs.slice(0,n).map(cliente);return {itens,proximoCursor:docs.length>n?itens.at(-1).id:null};}),
  dashboard:(opcoes={})=>executar(async({base})=>{
   const p=periodoGestao(opcoes),pedidos=query(collection(base,'pedidos'),where('criadoEm','>=',p.de),where('criadoEm','<',p.ate)),produtos=collection(base,'produtos');
   const contar=async q=>(await getCountFromServer(q)).data().count;
   const [quantidade,totais,financeiro,porStatus,totalProdutos,ativos,indisponiveis,recentes]=await Promise.all([
    contar(pedidos),getAggregateFromServer(pedidos,{valor:sum('total')}),
    getAggregateFromServer(query(pedidos,where('pagamento.status','==','confirmado'),where('status','!=','cancelado'),orderBy('criadoEm'),orderBy('status')),{valor:sum('total')}),
    Promise.all(Object.keys(TRANSICOES_STATUS).map(async status=>[status,await contar(query(pedidos,where('status','==',status)))])),contar(produtos),contar(query(produtos,where('ativo','==',true))),contar(query(produtos,where('ativo','==',true),where('disponivel','==',false))),getDocsFromServer(query(pedidos,orderBy('criadoEm','desc'),limit(5)))
   ]);
   return {periodo:{inicio:p.inicio,fim:p.fim,fuso:'America/Sao_Paulo'},pedidos:quantidade,porStatus:Object.fromEntries(porStatus),valorPedidos:totais.data().valor || 0,valorPagamentosConfirmados:financeiro.data().valor || 0,produtos:{disponiveis:ativos-indisponiveis,indisponiveis:totalProdutos-(ativos-indisponiveis)},recentes:recentes.docs.map(s=>{if(s.data().lojaId!==lojaId)throw falha('Pedido fora do estabelecimento solicitado.',409);return projetarPedido(s.data(),s.id);}),criterio:'Pedidos criados no período. Pagamentos confirmados manualmente, excluindo pedidos cancelados; não representa liquidação de gateway.'};
  })
 };
}
