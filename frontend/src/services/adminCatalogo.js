import {textoBemFormado} from '../lib/textoBemFormado.js';
import {collection,doc,getDocFromServer,getDocsFromServer,getCountFromServer,query,where,orderBy,documentId,startAfter,limit} from 'firebase/firestore';
import {CAMPOS_PUBLICOS,projetarRegistro,salvarComProjecao} from './projecaoPublica.js';
const falha=(message,status=400,code='ADMIN_CATALOGO_INVALIDO')=>Object.assign(new Error(message),{status,code});
const id=v=>{if(typeof v!=='string' || !v || v.length>128 || !textoBemFormado(v) || /[\/\\\u0000-\u001f\u007f-\u009f]/u.test(v) || ['.','..'].includes(v))throw falha('Identificador inválido.');return v;};
const tipoValido=n=>{if(!['produtos','categorias'].includes(n))throw falha('Operação fora do catálogo administrativo.');return n;};
export const B03_BLOQUEADO='Excluir categorias definitivamente permanece bloqueado: a ausência de produtos vinculados não pode ser comprovada pelas Rules. Use Desativar para ocultar a categoria do catálogo sem perder seus produtos.';
function texto(v,n,max,obrigatorio=false,multilinha=false){if(typeof v!=='string' || !textoBemFormado(v) || v.length>max || obrigatorio && !v.trim() || /[\u007f-\u009f]/u.test(v) || (multilinha?/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u:/[\u0000-\u001f]/u).test(v))throw falha(n+' inválido.');return v.trim();}
function validar(tipo,d,novo){
 if(!d || typeof d!=='object' || Array.isArray(d) || !Object.keys(d).length || Object.keys(d).some(k=>!Object.hasOwn(CAMPOS_PUBLICOS[tipo],k)))throw falha('Campo não permitido nesta operação.');
 const r={...d};
 for(const [k,max] of [['nome',200],['descricao',2000],['icone',50]])if(r[k]!==undefined)r[k]=texto(r[k],k,max,k==='nome',k==='descricao');
 for(const k of ['ativo','disponivel'])if(r[k]!==undefined && typeof r[k]!=='boolean')throw falha(k+' inválido.');
 if(novo && r.nome===undefined)throw falha('Nome é obrigatório.');
 if(tipo==='produtos'){
  if(r.preco!==undefined || novo){const v=r.preco,c=v*100;if(typeof v!=='number' || !Number.isFinite(v) || v<0 || v>1000000 || Math.abs(c-Math.round(c))>Number.EPSILON*Math.max(1,Math.abs(c))*4)throw falha('Preço deve ter até duas casas decimais.');r.preco=Math.round(c)/100;}
  if(r.categoriaId!==undefined || novo)id(r.categoriaId);
  if(r.imagem!==undefined && r.imagem!==''){try{const u=new URL(texto(r.imagem,'Imagem',2048));if(!['http:','https:'].includes(u.protocol) || u.username || u.password)throw Error();r.imagem=u.href;}catch{throw falha('Imagem deve ser uma URL HTTP ou HTTPS válida.');}}
  if(r.ingredientes!==undefined){if(!Array.isArray(r.ingredientes) || r.ingredientes.length>50)throw falha('Ingredientes inválidos.');r.ingredientes=r.ingredientes.map(v=>texto(v,'Ingrediente',200));}
  if(novo)Object.assign(r,{ativo:r.ativo ?? true,disponivel:r.disponivel ?? true,descricao:r.descricao ?? '',imagem:r.imagem ?? ''});
 }else{if(r.ordem!==undefined && (!Number.isInteger(r.ordem) || r.ordem<0 || r.ordem>10000))throw falha('Ordem inválida.');if(novo)r.ativo ??= true;}
 return r;
}
function projetar(tipo,s){const d=s.data(),r={id:s.id,...projetarRegistro(tipo,d)};for(const k of ['criadoEm','atualizadoEm'])if(d[k]?.seconds!==undefined)r[k]={_seconds:d[k].seconds,_nanoseconds:d[k].nanoseconds};return r;}
export function criarAdminCatalogo({db,auth,sessaoExistente,lojaId,invalidar=()=>{}}){
 async function executar(fn){
  try{
   id(lojaId);if(!db || !auth)throw falha('Administração não configurada.',503);
   const user=await sessaoExistente(),uid=user.uid;
   const conferir=()=>{if(auth.currentUser?.uid!==uid)throw falha('A sessão mudou. Entre novamente.',409,'SESSION_CHANGED');};conferir();
   if(user.isAnonymous)throw falha('Entre com uma conta administrativa.',401);
   const u=await getDocFromServer(doc(db,'usuarios',uid));conferir();const d=u.data();
   if(!u.exists() || d.role!=='admin' || d.ativo!==true || d.lojaId!==lojaId)throw falha('Acesso negado.',403);
   const resultado=await fn({uid,conferir,base:doc(db,'lojas',lojaId)});conferir();return resultado;
  }catch(e){
   if(e.code==='permission-denied'){
    // Recusa por vínculo/revisão não deve apagar o formulário de um admin válido.
    let autorizado=false;
    try {const u=auth?.currentUser;if(u && !u.isAnonymous){const s=await getDocFromServer(doc(db,'usuarios',u.uid)),d=s.data();autorizado=auth.currentUser?.uid===u.uid && d?.role==='admin' && d.ativo===true && d.lojaId===lojaId;}}catch{}
    if(autorizado)throw falha('Alteração recusada pelas regras do catálogo. Confira a categoria e os dados antes de confirmar novamente.',409,'ADMIN_CATALOGO_CONFLITO');
    invalidar();throw falha('Acesso negado.',403);
   }
   if(e.status===401 || e.status===403)invalidar();if(e.status)throw e;
   throw falha('Não foi possível confirmar a operação. Os dados do formulário foram preservados. Verifique a conexão.',503,'ADMIN_CATALOGO_INCERTO');
  }
 }
 async function buscarInterno(base,tipo,identificador){const s=await getDocFromServer(doc(base,tipo,id(identificador)));if(!s.exists())throw falha('Registro não encontrado.',404);return projetar(tipo,s);}
 return {
  // Valida autoridade atual no servidor sem buscar os dados da loja só para o gate.
  autorizar:()=>executar(({uid})=>({uid})),
  sessao:()=>executar(async({uid,base})=>{const l=await getDocFromServer(base);if(!l.exists())throw falha('Loja não encontrada.',404);return {uid,email:auth.currentUser.email || '',role:'admin',lojaId,loja:{id:lojaId,nome:l.data().nome || ''}};}),
  buscar:(tipo,identificador)=>executar(({base})=>buscarInterno(base,tipoValido(tipo),identificador)),
  listar:(tipo,opcoes={})=>executar(async({base,conferir})=>{
   tipoValido(tipo);const permitidos=['limite','cursor',...(tipo==='produtos'?['categoriaId']:['contagem'])];if(Object.keys(opcoes).some(k=>!permitidos.includes(k)))throw falha('Filtro inválido.');
   const n=Number(opcoes.limite || 25);if(!Number.isInteger(n) || n<1 || n>100)throw falha('Limite deve estar entre 1 e 100.');
   const c=collection(base,tipo),f=[];if(tipo==='produtos' && opcoes.categoriaId)f.push(where('categoriaId','==',id(opcoes.categoriaId)));
   f.push(orderBy(documentId()));if(opcoes.cursor){const cursor=id(opcoes.cursor);if(!(await getDocFromServer(doc(c,cursor))).exists())throw falha('Cursor inválido.');f.push(startAfter(cursor));}
   const docs=(await getDocsFromServer(query(c,...f,limit(n+1)))).docs;conferir();const itens=docs.slice(0,n).map(s=>projetar(tipo,s));
   if(tipo==='categorias' && opcoes.contagem!=='0')await Promise.all(itens.map(async c=>{c.produtos=(await getCountFromServer(query(collection(base,'produtos'),where('categoriaId','==',c.id)))).data().count;}));
   return {itens,proximoCursor:docs.length>n?itens.at(-1).id:null};
  }),
  salvar:(tipo,identificador,dados,criacaoId)=>executar(async({base,conferir})=>{
   tipoValido(tipo);const novo=!identificador,patch=validar(tipo,dados,novo);
   const destino=novo?(criacaoId?doc(base,tipo,id(criacaoId)):doc(collection(base,tipo))):doc(base,tipo,id(identificador));conferir();
   // Analisar bloqueios previsíveis antes da transação. Uma categoria inativa
   // impede ativação do produto, inclusive se o próprio produto já existir.
   if(tipo==='produtos'){
    const anterior=novo?null:await getDocFromServer(destino);
    if(!novo && !anterior.exists())throw falha('Produto não encontrado.',404);
    const atual={...(anterior?.data() || {}),...patch};
    const categoriaId=atual.categoriaId;
    if(atual.ativo!==false){
      if(!categoriaId || typeof categoriaId!=='string')throw falha('Este produto está sem categoria válida. Edite e escolha uma categoria antes de ativar.',409,'PRODUTO_SEM_CATEGORIA');
      const categoriaSnap=await getDocFromServer(doc(base,'categorias',id(categoriaId)));
      if(!categoriaSnap.exists())throw falha('A categoria vinculada a este produto não existe. Edite e escolha uma categoria válida.',409,'PRODUTO_CATEGORIA_AUSENTE');
      if(categoriaSnap.data().ativo===false)throw falha('A categoria "'+(categoriaSnap.data().nome || categoriaId)+'" está inativa. Ative a categoria primeiro ou edite o produto e escolha outra categoria ativa.',409,'PRODUTO_CATEGORIA_INATIVA');
    }else if(categoriaId){
      const categoriaSnap=await getDocFromServer(doc(base,'categorias',id(categoriaId)));
      if(!categoriaSnap.exists())throw falha('A categoria vinculada não existe. Edite o produto e escolha uma categoria cadastrada.',409,'PRODUTO_CATEGORIA_AUSENTE');
    }
    conferir();
   }
   await salvarComProjecao(db,lojaId,tipo,destino.id,patch,{modo:novo?'criar':'editar',retomarCriacao:novo&&Boolean(criacaoId),conferir,registrarDatas:true});conferir();
   const salvo=await getDocFromServer(destino);if(!salvo.exists() || salvo.metadata.fromCache || salvo.metadata.hasPendingWrites)throw falha('Não foi possível confirmar a gravação.',503,'ADMIN_CATALOGO_INCERTO');
   return projetar(tipo,salvo);
  }),
  excluir:(tipo,identificador)=>executar(async({base,conferir})=>{
   tipoValido(tipo);id(identificador);
   if(tipo==='categorias'){await buscarInterno(base,tipo,identificador);throw falha(B03_BLOQUEADO,409,'B03_BLOQUEADO');}
   // DELETE original é remoção lógica, nunca apaga snapshots/pedidos.
   await salvarComProjecao(db,lojaId,'produtos',identificador,{ativo:false,disponivel:false},{modo:'editar',conferir,registrarDatas:true});
   return buscarInterno(base,'produtos',identificador);
  })
 };
}
