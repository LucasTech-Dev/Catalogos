import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,createUserWithEmailAndPassword,signOut} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,getDocFromServer,setDoc,updateDoc,deleteDoc,writeBatch,serverTimestamp,terminate} from 'firebase/firestore';
import {criarAdminCatalogo} from '../../../frontend/src/services/adminCatalogo.js';
import {projetarRegistro,salvarComProjecao} from '../../../frontend/src/services/projecaoPublica.js';
import {criarServicoPedidos} from '../../../frontend/src/services/pedidos.js';
import {verificarAdminCatalogoNavegador} from './admin-catalogo-browser.js';
const host=process.env.FIRESTORE_EMULATOR_HOST,authHost=process.env.FIREBASE_AUTH_EMULATOR_HOST;
for(const h of [host,authHost])assert.match(h || '',/^(127\.0\.0\.1|localhost):\d+$/);assert.equal(process.env.CATALOGOS_EMULATOR_EXCLUSIVO,'1');
const projectId='demo-catalogos-admin006',run=Date.now(),L='admin006-'+run,B=L+'-b';
const require=createRequire(new URL('../../../backend/package.json',import.meta.url)),admin=require('firebase-admin/app'),fsAdmin=require('firebase-admin/firestore');
const appAdmin=admin.initializeApp({projectId},'ordem006'),seed=fsAdmin.getFirestore(appAdmin),atores=[];let checks=0;
const ok=(v,m)=>{assert.ok(v,m);checks++;};
const negar=async fn=>{await assert.rejects(fn,e=>e.code==='permission-denied');checks++;};
const bloqueio=async fn=>{await assert.rejects(fn,e=>e.code==='B03_BLOQUEADO' && e.status===409);checks++;};
async function carregar(content){const r=await fetch(`http://${host}/emulator/v1/projects/${projectId}:securityRules`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{name:'firestore.rules',content}]}})});assert.ok(r.ok,await r.text());}
async function ator(tipo,loja=L){const app=initializeApp({projectId,apiKey:'fake-api-key'},'admin006-'+atores.length),db=getFirestore(app),auth=getAuth(app),[h,p]=host.split(':');connectFirestoreEmulator(db,h,Number(p));connectAuthEmulator(auth,'http://'+authHost,{disableWarnings:true});await createUserWithEmailAndPassword(auth,`${tipo}-${atores.length}-${run}@teste.local`,'Senha-local-teste-123!');const a={app,db,auth,uid:auth.currentUser.uid,email:auth.currentUser.email};atores.push(a);if(tipo==='admin')await seed.doc('usuarios/'+a.uid).set({role:'admin',ativo:true,lojaId:loja});a.api=criarAdminCatalogo({db,auth,sessaoExistente:async()=>auth.currentUser,lojaId:L});return a;}
let a,b,c,cat,produto;
const ref=(ator,path)=>doc(ator.db,path),orig=id=>`lojas/${L}/produtos/${id}`,pub=id=>`catalogosPublicos/${L}/produtos/${id}`,ctrl=`lojas/${L}/controleCompra/versao`;
const novo=(nome,categoriaId)=>({nome,descricao:'Descrição\nem duas linhas',categoriaId,preco:10.25,ativo:true,disponivel:true,ingredientes:['Ingrediente'],imagem:''});
const pedido=itens=>({itens,tipoEntrega:'retirada',cliente:{nome:'Cliente sintético',telefone:'51999999999'},pagamento:{forma:'pix'},observacao:'Teste006'});
try {
 await carregar(await readFile(new URL('../../../firebase/firestore.rules',import.meta.url),'utf8'));
 a=await ator('admin');b=await ator('admin',B);c=await ator('cliente');
 const loja={nome:'Loja admin sintética',ativo:true,entrega:{habilitada:true,taxa:5},retirada:{habilitada:true},pagamentos:{pix:true},whatsapp:'51999999999'};
 for(const lojaId of [L,B]){await seed.doc('lojas/'+lojaId).set(loja);await seed.doc('catalogosPublicos/'+lojaId).set(projetarRegistro('loja',loja));}
 await setDoc(ref(a,ctrl),{revisao:0,alteracao:null});
 ok((await a.api.sessao()).lojaId===L,'sessao SDK loja');
 for(const x of [b,c]){await assert.rejects(()=>x.api.sessao(),e=>e.status===403);checks++;await negar(()=>setDoc(ref(x,'usuarios/'+x.uid),{role:'admin',ativo:true,lojaId:L}));}
 cat=await a.api.salvar('categorias',null,{nome:'Categoria principal',descricao:'Descrição',ordem:1});
 ok(cat.ativo && cat.atualizadoEm._seconds>0,'categoria criada com confirmacao e data');
 const vazia=await a.api.salvar('categorias',null,{nome:'Categoria vazia'});
 const inativa=await a.api.salvar('categorias',null,{nome:'Categoria inativa',ativo:false});
 ok((await a.api.salvar('categorias',inativa.id,{ativo:true})).ativo,'reativacao segura');
 ok((await a.api.salvar('categorias',cat.id,{nome:'Categoria editada',icone:'x'})).nome==='Categoria editada','editar categoria');
 produto=await a.api.salvar('produtos',null,novo('Produto principal',cat.id));
 ok(produto.criadoEm._seconds>0 && produto.atualizadoEm._seconds>0,'datas do produto');
 ok((await a.api.buscar('produtos',produto.id)).id===produto.id,'detalhe SDK');
 const antes=(await getDocFromServer(ref(a,ctrl))).data().revisao;
 const mudado=await a.api.salvar('produtos',produto.id,{preco:19.99});ok(mudado.preco===19.99,'preco editado');
 ok((await getDocFromServer(ref(a,orig(produto.id)))).data().preco===19.99 && (await getDocFromServer(ref(c,pub(produto.id)))).data().preco===19.99,'origem e projecao correspondem');
 ok((await getDocFromServer(ref(a,ctrl))).data().revisao===antes+1,'revisao avancou no mesmo commit');
 await seed.doc(orig(produto.id)).update({privado:'sentinela'});
 ok(!Object.hasOwn(await a.api.buscar('produtos',produto.id),'privado'),'DTO admin allowlist');
 await a.api.salvar('produtos',produto.id,{descricao:'Editado'});ok((await seed.doc(orig(produto.id)).get()).data().privado==='sentinela','privado legado preservado');
 const clienteServico=criarServicoPedidos({db:c.db,auth:c.auth,sessao:async()=>c.auth.currentUser,lojaId:L});
 const itens=[{produtoId:produto.id,quantidade:1}];
 const finalizado=await clienteServico.criarPedido(pedido(itens),{chave:`pedido-antes-${run}`});ok(finalizado.total===19.99,'pedido comercial antes da alteracao');
 await a.api.salvar('produtos',produto.id,{preco:20.99});ok((await clienteServico.buscarPedido(finalizado.id)).total===19.99,'pedido finalizado preservado');
 // Tentar continuar rascunho completo da revisao anterior com payload antigo.
 const chave=`rascunho-${run}-001`,id='a'.repeat(64),assinatura='b'.repeat(64),p=produto.id;
 const etapa=ref(c,`lojas/${L}/clientes/${c.uid}/tentativasCompra/${chave}`),rev=(await getDocFromServer(ref(c,ctrl))).data().revisao;
 const body={...pedido(itens),enderecoId:null};await setDoc(etapa,{lojaId:L,clienteId:c.uid,revisao:rev,dados:body,marcador:id,assinatura,itens:[],ids:[],unidades:0,centavos:0,estado:'aberta',criadoEm:serverTimestamp(),expiraEm:new Date(Date.now()+600000)});
 const i={produtoId:p,nome:'Produto principal',precoUnitario:20.99,quantidade:1,subtotal:20.99};await updateDoc(etapa,{itens:[i],ids:[p],unidades:1,centavos:2099});
 await a.api.salvar('produtos',produto.id,{preco:21.99});
 const lote=writeBatch(c.db);lote.set(ref(c,`lojas/${L}/pedidos/${id}`),{lojaId:L,clienteId:c.uid,enderecoId:null,endereco:null,itens:[i],subtotal:20.99,taxaEntrega:0,desconto:0,total:20.99,pagamento:{forma:'pix',status:'pendente',valor:20.99},observacao:body.observacao,tipoEntrega:'retirada',status:'recebido',cliente:body.cliente,criadoEm:serverTimestamp(),atualizadoEm:serverTimestamp(),operacaoCompra:chave});lote.set(ref(c,`lojas/${L}/idempotencia/${id}`),{clienteId:c.uid,lojaId:L,pedidoId:id,assinatura});await negar(()=>lote.commit());
 await a.api.salvar('produtos',produto.id,{disponivel:false});await assert.rejects(()=>clienteServico.criarPedido(pedido(itens),{chave:`indisponivel-${run}`}),e=>e.code==='COMPRA_REVISAR');checks++;
 await a.api.salvar('produtos',produto.id,{disponivel:true});
 const removido=await a.api.excluir('produtos',produto.id);ok(removido.ativo===false && removido.disponivel===false,'DELETE produto logico');
 ok((await seed.doc(orig(produto.id)).get()).exists,'produto nunca apagado');await negar(()=>deleteDoc(ref(a,orig(produto.id))));
 await a.api.salvar('produtos',produto.id,{ativo:true,disponivel:true});
 // B-03: desativação reversível candidata local; exclusão física continua negada.
 for(const t of [cat,vazia]){
  await a.api.salvar('categorias',t.id,{ativo:false});
  ok((await seed.doc(`catalogosPublicos/${L}/categorias/${t.id}`).get()).data().ativo===false,'desativação sincroniza projeção');
  await bloqueio(()=>a.api.excluir('categorias',t.id));
  for(const x of [b,c]){await assert.rejects(()=>x.api.salvar('categorias',t.id,{ativo:true}),e=>e.status===403);checks++;await negar(()=>salvarComProjecao(x.db,L,'categorias',t.id,{ativo:true}));}
  if(t.id===cat.id){await assert.rejects(()=>a.api.salvar('produtos',produto.id,{ativo:true}),e=>e.code==='PRODUTO_CATEGORIA_INATIVA');checks++;await assert.rejects(()=>clienteServico.criarPedido(pedido(itens),{chave:`categoria-inativa-${run}`}),e=>e.code==='COMPRA_REVISAR');checks++;}
  const d=writeBatch(a.db);d.delete(ref(a,`lojas/${L}/categorias/${t.id}`));d.delete(ref(a,`catalogosPublicos/${L}/categorias/${t.id}`));await negar(()=>d.commit());
  await a.api.salvar('categorias',t.id,{ativo:true});
  ok((await seed.doc(`lojas/${L}/categorias/${t.id}`).get()).data().ativo===true,'reativação reversível');
 }
 ok((await clienteServico.buscarPedido(finalizado.id)).total===19.99,'histórico preservado após desativação e reativação');
 const contagens=await a.api.listar('categorias');ok(contagens.itens.find(x=>x.id===cat.id).produtos===1 && contagens.itens.find(x=>x.id===vazia.id).produtos===0,'contagem apenas informativa');
 await a.api.salvar('produtos',produto.id,{categoriaId:vazia.id});await bloqueio(()=>a.api.excluir('categorias',vazia.id));await a.api.salvar('produtos',produto.id,{categoriaId:cat.id});
 for(const x of [b,c]){await assert.rejects(()=>x.api.listar('produtos'),e=>e.status===403);checks++;await assert.rejects(()=>x.api.salvar('produtos',produto.id,{preco:1}),e=>e.status===403);checks++;await negar(()=>updateDoc(ref(x,orig(produto.id)),{preco:1}));await negar(()=>updateDoc(ref(x,pub(produto.id)),{preco:1}));}
 for(const patch of [{privado:'x'},{role:'admin'},{preco:1.001},{preco:-1}]){await assert.rejects(()=>a.api.salvar('produtos',produto.id,patch),e=>e.status===400);checks++;}
 await negar(()=>salvarComProjecao(a.db,L,'produtos',produto.id,{preco:1.001}));
 await assert.rejects(()=>a.api.salvar('produtos',produto.id,{categoriaId:'ausente'}),e=>e.status===409);checks++;
 await negar(()=>updateDoc(ref(a,ctrl),{revisao:0}));
 await negar(()=>updateDoc(ref(a,orig(produto.id)),{atualizadoEm:new Date(0)}));
 const bruto=(await getDocFromServer(ref(a,pub(produto.id)))).data();const parcial=writeBatch(a.db);parcial.update(ref(a,orig(produto.id)),{preco:1});parcial.set(ref(a,pub(produto.id)),{...bruto,preco:1});await negar(()=>parcial.commit());
 ok((await getDocFromServer(ref(a,pub(produto.id)))).data().preco===21.99,'falha parcial preserva preco');
 const privado=writeBatch(a.db);privado.set(ref(a,pub(produto.id)),{...bruto,privado:'vazamento'});await negar(()=>privado.commit());
 const corridas=await Promise.allSettled([a.api.salvar('produtos',produto.id,{preco:30}),a.api.salvar('produtos',produto.id,{preco:31})]);
 ok(corridas.some(r=>r.status==='fulfilled'),'ao menos uma atualizacao concorrente valida');
 const atual=(await getDocFromServer(ref(a,orig(produto.id)))).data(),espelho=(await getDocFromServer(ref(a,pub(produto.id)))).data();ok(atual.preco===espelho.preco && [30,31].includes(atual.preco),'concorrencia nao diverge');
 // Catálogo de 50 distintos criado pelas mesmas escritas do painel.
 const ids=[produto.id];for(let n=1;n<50;n++)ids.push((await a.api.salvar('produtos',null,novo('Produto '+n,cat.id))).id);
 const pg1=await a.api.listar('produtos',{limite:25}),pg2=await a.api.listar('produtos',{limite:25,cursor:pg1.proximoCursor});ok(pg1.itens.length===25 && pg2.itens.length===25 && !pg2.proximoCursor && !pg1.itens.some(x=>pg2.itens.some(y=>y.id===x.id)),'paginacao estavel por ID');
 ok((await a.api.listar('produtos',{categoriaId:cat.id,limite:100})).itens.length===50,'filtro por categoria');
 await assert.rejects(()=>a.api.listar('produtos',{limite:101}),e=>e.status===400);checks++;
 await assert.rejects(()=>a.api.buscar('produtos','inexistente'),e=>e.status===404);checks++;
 await assert.rejects(()=>a.api.salvar('produtos','inexistente',{nome:'Nao criar'}),e=>e.status===404);checks++;
 const compra50=await clienteServico.criarPedido(pedido(ids.map(produtoId=>({produtoId,quantidade:1}))),{chave:`pedido50-aposadmin-${run}`});ok(compra50.itens.length===50 && compra50.total===Number((atual.preco+49*10.25).toFixed(2)),'pedido50 apos alteracoes administrativas');
 console.log(JSON.stringify({adminCatalogoSdk:'aprovado',projectId,checks,pedido50:compra50.itens.length,total50:compra50.total,B03:'desativacao_reversivel_exclusao_bloqueada',produtoExcluido:'desativacao_logica',express:false}));
 const navegador=await verificarAdminCatalogoNavegador({projectId,host,authHost,lojaId:L,email:a.email,emailCliente:c.email,emailOutraLoja:b.email,categoriaId:cat.id,localizar:async nome=>{const q=await seed.collection(`lojas/${L}/produtos`).where('nome','==',nome).get();assert.equal(q.size,1);return {id:q.docs[0].id,...q.docs[0].data()};}});
 console.log(JSON.stringify({admin006:'aprovado_local',sdkChecks:checks,navegador,B03:'parcial_operacoes_perigosas_bloqueadas',lojaRealAlterada:false}));
}finally{await carregar("rules_version = '2'; service cloud.firestore { match /databases/{db}/documents { match /{d=**} { allow read, write: if false; } } }");for(const x of atores){await signOut(x.auth);await terminate(x.db);await deleteApp(x.app);}await seed.terminate();await admin.deleteApp(appAdmin);}
