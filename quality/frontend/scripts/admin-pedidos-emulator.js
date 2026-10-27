import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,createUserWithEmailAndPassword,signOut} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,collection,query,limit,getDocsFromServer,getDocFromServer,setDoc,updateDoc,deleteDoc,writeBatch,serverTimestamp,terminate} from 'firebase/firestore';
import {criarAdminCatalogo} from '../../../frontend/src/services/adminCatalogo.js';
import {projetarRegistro,salvarComProjecao} from '../../../frontend/src/services/projecaoPublica.js';
import {criarServicoPedidos} from '../../../frontend/src/services/pedidos.js';
import {verificarAdminPedidosNavegador} from './admin-pedidos-browser.js';
import {criarAdminGestao} from '../../../frontend/src/services/adminGestao.js';
import {writeFile} from 'node:fs/promises';
import {criarAdminPedidos,TRANSICOES_STATUS,TRANSICOES_PAGAMENTO} from '../../../frontend/src/services/adminPedidos.js';
const host=process.env.FIRESTORE_EMULATOR_HOST,authHost=process.env.FIREBASE_AUTH_EMULATOR_HOST;
for(const h of [host,authHost])assert.match(h || '',/^(127\.0\.0\.1|localhost):\d+$/);assert.equal(process.env.CATALOGOS_EMULATOR_EXCLUSIVO,'1');
const projectId='demo-catalogos-admin007',run=Date.now(),L='admin007-'+run,B=L+'-b';
const require=createRequire(new URL('../../../backend/package.json',import.meta.url)),admin=require('firebase-admin/app'),fsAdmin=require('firebase-admin/firestore');
const appAdmin=admin.initializeApp({projectId},'ordem007'),seed=fsAdmin.getFirestore(appAdmin),atores=[];let checks=0;
const ok=(v,m)=>{assert.ok(v,m);checks++;};
const negar=async fn=>{await assert.rejects(fn,e=>e.code==='permission-denied');checks++;};
const bloqueio=async fn=>{await assert.rejects(fn,e=>e.code==='B03_BLOQUEADO' && e.status===409);checks++;};
async function carregar(content){const r=await fetch(`http://${host}/emulator/v1/projects/${projectId}:securityRules`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{name:'firestore.rules',content}]}})});assert.ok(r.ok,await r.text());}
async function ator(tipo,loja=L){const app=initializeApp({projectId,apiKey:'fake-api-key'},'admin007-'+atores.length),db=getFirestore(app),auth=getAuth(app),[h,p]=host.split(':');connectFirestoreEmulator(db,h,Number(p));connectAuthEmulator(auth,'http://'+authHost,{disableWarnings:true});await createUserWithEmailAndPassword(auth,`${tipo}-${atores.length}-${run}@teste.local`,'Senha-local-teste-123!');const a={app,db,auth,uid:auth.currentUser.uid,email:auth.currentUser.email};atores.push(a);if(tipo==='admin')await seed.doc('usuarios/'+a.uid).set({role:'admin',ativo:true,lojaId:loja});a.catalogo=criarAdminCatalogo({db,auth,sessaoExistente:async()=>auth.currentUser,lojaId:L});a.api=criarAdminPedidos({db,auth,sessaoExistente:async()=>auth.currentUser,lojaId:L});return a;}
const ref=(x,path)=>doc(x.db,path),path=id=>`lojas/${L}/pedidos/${id}`;
const basePedido=(uid,status='recebido',financeiro='pendente')=>({lojaId:L,clienteId:uid,status,tipoEntrega:'retirada',cliente:{nome:'Cliente sintético',telefone:'51999999999'},endereco:null,enderecoId:null,itens:[{produtoId:'p',nome:'Snapshot histórico',precoUnitario:10,quantidade:1,subtotal:10}],subtotal:10,desconto:0,taxaEntrega:0,total:10,pagamento:{forma:'pix',status:financeiro,valor:10},criadoEm:new Date(),atualizadoEm:new Date()});
// Ataques usam SDK direto com envelope formalmente válido, sem passar pela validação JS.
async function direto(x,identificador,tipo,novo,extra={},eventoExtra={}){
 const s=await seed.doc(path(identificador)).get(),d=s.data(),revisao=(d.revisaoAdministrativa ?? 0)+1;
 const e=doc(x.db,path(identificador)+'/historicoAdministrativo/'+`evento-${run}-${checks}`);
 const registro={id:e.id,tipo,anterior:tipo==='status'?d.status:d.pagamento.status,novo,uid:x.uid,origem:'manual_estabelecimento',revisao,criadoEm:serverTimestamp(),...eventoExtra};
 const patch={revisaoAdministrativa:revisao,ultimaAlteracaoAdministrativa:registro,atualizadoEm:serverTimestamp(),...(tipo==='status'?{status:novo}:{pagamento:{...d.pagamento,status:novo,atualizadoEm:serverTimestamp(),registroManual:{uid:x.uid,origem:'manual_estabelecimento',criadoEm:serverTimestamp()}}}),...extra};
 if(extra.pagamento && tipo==='pagamento')patch.pagamento={...d.pagamento,status:novo,atualizadoEm:serverTimestamp(),registroManual:{uid:x.uid,origem:'manual_estabelecimento',criadoEm:serverTimestamp()},...extra.pagamento};
 const b=writeBatch(x.db);b.update(ref(x,path(identificador)),patch);b.set(e,registro);return b.commit();
}
try{
 await carregar(await readFile(new URL('../../../firebase/firestore.rules',import.meta.url),'utf8'));
 const a=await ator('admin'),b=await ator('admin',B),c=await ator('cliente'),outro=await ator('cliente');
 const loja={nome:'Loja pedidos sintética',ativo:true,entrega:{habilitada:true,taxa:5},retirada:{habilitada:true},pagamentos:{pix:true,dinheiro:true,cartao_credito:true,cartao_debito:true},whatsapp:'51999999999'};
 for(const l of [L,B]){await seed.doc('lojas/'+l).set(loja);await seed.doc('catalogosPublicos/'+l).set(projetarRegistro('loja',loja));}
 await seed.doc(`lojas/${L}/controleCompra/versao`).set({revisao:0,alteracao:null});
 const cat=await a.catalogo.salvar('categorias',null,{nome:'Categoria007'}),ids=[];
 for(let n=0;n<50;n++)ids.push((await a.catalogo.salvar('produtos',null,{nome:'Produto '+n,categoriaId:cat.id,preco:10,ativo:true,disponivel:true})).id);
 const cli=criarServicoPedidos({db:c.db,auth:c.auth,sessao:async()=>c.auth.currentUser,lojaId:L});
 const compra=await cli.criarPedido({itens:ids.map(produtoId=>({produtoId,quantidade:1})),tipoEntrega:'retirada',cliente:{nome:'Cliente sintético',telefone:'51999999999'},pagamento:{forma:'pix'},observacao:'Pedido50 real SDK'},{chave:`compra-admin007-${run}`});
 ok(compra.itens.length===50 && compra.total===500,'checkout SDK persistiu50');
 ok((await a.api.listar()).itens.some(p=>p.id===compra.id),'checkout aparece no painel');
 let d=await a.api.buscar(compra.id);ok(d.itens.length===50 && d.total===500,'detalhe50');
 await a.catalogo.salvar('produtos',ids[0],{preco:20});ok((await a.api.buscar(compra.id)).total===500,'nao recalcula historico');
 await assert.rejects(()=>a.api.status(compra.id,'pagamento_confirmado',0),e=>e.status===400);checks++;
 d=await a.api.pagamento(compra.id,'confirmado',0);ok(d.pagamento.status==='confirmado' && d.status==='recebido' && d.registroPagamento.origem==='manual_estabelecimento','pagamento manual separado');
 for(const status of ['pagamento_confirmado','em_preparacao','pronto','saiu_para_entrega','entregue'])d=await a.api.status(compra.id,status,d.revisaoAdministrativa);
 ok((await cli.buscarPedido(compra.id)).status==='entregue','cliente acompanha estado persistido');
 ok((await cli.listarPedidos()).find(p=>p.id===compra.id)?.status==='entregue','listagem cliente rele estado persistido');
 const gestao=criarAdminGestao({db:a.db,auth:a.auth,sessaoExistente:async()=>a.auth.currentUser,lojaId:L});
 const painel=await gestao.dashboard();ok(painel.porStatus.entregue===1 && painel.valorPagamentosConfirmados===500,'dashboard rele transacoes operacionais e financeiras');

 ok(d.total===500 && d.itens[0].precoUnitario===10,'valores historicos preservados apos operacao');
 const hist=await getDocsFromServer(collection(a.db,path(compra.id)+'/historicoAdministrativo'));ok(hist.size===6,'historico atomicamente registrado');
 const publicoHistorico=await a.api.historico(compra.id);ok(publicoHistorico.length===6&&publicoHistorico[0].revisao===6&&!JSON.stringify(publicoHistorico).includes(a.uid),'histórico projetado ordenado sem identidade administrativa');
 for(const x of [b,c]){await assert.rejects(()=>x.api.historico(compra.id),e=>e.status===403);checks++;}

 await negar(()=>updateDoc(hist.docs[0].ref,{novo:'falso'}));await negar(()=>deleteDoc(hist.docs[0].ref));await negar(()=>getDocsFromServer(collection(c.db,path(compra.id)+'/historicoAdministrativo')));
 // Matriz inteira: todas as arestas válidas e todos os saltos inválidos pelas Rules reais.
 for(const atual of Object.keys(TRANSICOES_STATUS))for(const novo of Object.keys(TRANSICOES_STATUS)){
  const identificador='matriz-status';await seed.doc(path(identificador)).set(basePedido(c.uid,atual,novo==='pagamento_recusado'?'recusado':'confirmado'));
  if(TRANSICOES_STATUS[atual].includes(novo)){await direto(a,identificador,'status',novo);checks++;}else await negar(()=>direto(a,identificador,'status',novo));
 }
 for(const atual of Object.keys(TRANSICOES_PAGAMENTO))for(const novo of Object.keys(TRANSICOES_PAGAMENTO)){
  const identificador='matriz-financeiro';await seed.doc(path(identificador)).set(basePedido(c.uid,'recebido',atual));
  if(TRANSICOES_PAGAMENTO[atual].includes(novo)){await direto(a,identificador,'pagamento',novo);checks++;}else await negar(()=>direto(a,identificador,'pagamento',novo));
 }
 await seed.doc(path('ataques')).set({...basePedido(c.uid),privado:'sentinela'});
 for(const status of ['pagamento_confirmado','pagamento_recusado','inventado'])await negar(()=>direto(a,'ataques','status',status));
 for(const x of [c,b,outro]){
  await negar(()=>getDocsFromServer(query(collection(x.db,`lojas/${L}/pedidos`),limit(10))));
  if(x!==c)await negar(()=>getDocFromServer(ref(x,path('ataques'))));
  await negar(()=>direto(x,'ataques','status','cancelado'));await negar(()=>direto(x,'ataques','pagamento','confirmado'));
  await assert.rejects(()=>x.api.listar(),e=>e.status===403);checks++;
 }
 for(const patch of [{total:1},{subtotal:1},{desconto:1},{taxaEntrega:1},{clienteId:a.uid},{lojaId:B},{itens:[]},{cliente:{nome:'Adulterado'}},{endereco:null,enderecoId:'alheio'},{privado:'alterado'},{criadoEm:new Date(0)}])await negar(()=>direto(a,'ataques','status','cancelado',patch));
 for(const pagamento of [{forma:'dinheiro',status:'confirmado',valor:10},{forma:'pix',status:'confirmado',valor:1}])await negar(()=>direto(a,'ataques','pagamento','confirmado',{pagamento}));
 await negar(()=>direto(a,'ataques','pagamento','confirmado',{}, {origem:'banco'}));
 await negar(()=>direto(a,'ataques','status','cancelado',{revisaoAdministrativa:99}));
 await negar(()=>updateDoc(ref(a,path('ataques')),{status:'cancelado',atualizadoEm:serverTimestamp()}));
 await negar(()=>deleteDoc(ref(a,path('ataques'))));
 await negar(()=>setDoc(ref(a,path('ataques')+'/historicoAdministrativo/orfao'),{id:'orfao',novo:'cancelado'}));
 ok(!Object.hasOwn(await a.api.buscar('ataques'),'privado'),'DTO nao expoe campo desconhecido');
 for(const forma of ['pix','dinheiro','cartao_credito','cartao_debito']){
  await seed.doc(path('forma-'+forma)).set({...basePedido(c.uid),pagamento:{forma,status:'pendente',valor:10}});
  const d=await a.api.pagamento('forma-'+forma,'confirmado',0);ok(d.pagamento.forma===forma && d.pagamento.valor===10,'forma preservada '+forma);
 }
 for(const estado of ['recusado','cancelado']){await seed.doc(path('fin-'+estado)).set(basePedido(c.uid));const d=await a.api.pagamento('fin-'+estado,estado,0);ok(d.pagamento.status===estado && d.status==='recebido','financeiro separado '+estado);}
 await seed.doc(path('cancelado')).set(basePedido(c.uid,'cancelado'));
 await negar(()=>direto(a,'cancelado','pagamento','confirmado'));
 await seed.doc(path('corrida')).set(basePedido(c.uid));
 const corrida=await Promise.allSettled([a.api.pagamento('corrida','confirmado',0),a.api.pagamento('corrida','recusado',0)]);
 ok(corrida.filter(x=>x.status==='fulfilled').length===1 && corrida.find(x=>x.status==='rejected').reason.code==='ADMIN_PEDIDO_CONFLITO','corrida perde com conflito explicito');
 await assert.rejects(()=>a.api.status('corrida','cancelado',0),e=>e.code==='ADMIN_PEDIDO_CONFLITO');checks++;
 ok((await seed.collection(path('corrida')+'/historicoAdministrativo').get()).size===1,'corrida nao gera evento de tentativa recusada');
 await seed.doc(path('corrida-status')).set(basePedido(c.uid,'pagamento_confirmado','confirmado'));
 const operacional=await Promise.allSettled([a.api.status('corrida-status','em_preparacao',0),a.api.status('corrida-status','cancelado',0)]);
 ok(operacional.filter(x=>x.status==='fulfilled').length===1 && operacional.find(x=>x.status==='rejected').reason.code==='ADMIN_PEDIDO_CONFLITO','concorrencia operacional preserva decisao recente');
 await assert.rejects(()=>a.api.status('ataques','cancelado'),e=>e.code==='ADMIN_PEDIDO_CONFLITO');checks++;
 // Datas iguais exercitam desempate/cursor por snapshot sem perder pedidos.
 const stamp=new Date('2026-10-23T12:00:00Z');for(let n=0;n<28;n++)await seed.doc(path('paginado-'+String(n).padStart(2,'0'))).set({...basePedido(c.uid),criadoEm:stamp});
 const vistos=[];let cursor;do{const p=await a.api.listar({limite:7,...(cursor?{cursor}:{})});vistos.push(...p.itens);cursor=p.proximoCursor;}while(cursor);
 ok(vistos.length===new Set(vistos.map(p=>p.id)).size && vistos.filter(p=>p.id.startsWith('paginado')).length===28,'paginacao sem perdas/duplicatas');
 ok(vistos.every((p,i)=>!i || vistos[i-1].criadoEm._seconds>=p.criadoEm._seconds),'ordenacao desc preservada');
 ok((await a.api.listar({status:'entregue'})).itens.every(p=>p.status==='entregue'),'filtro status');
 for(const options of [{limite:101},{status:'inventado'},{clienteId:'fora/do-contrato'},{cursor:'inexistente'}]){await assert.rejects(()=>a.api.listar(options),e=>e.status===400);checks++;}
 await assert.rejects(()=>a.api.buscar('ausente'),e=>e.status===404);checks++;
 const doCliente=[];let cursorCliente;
 do{const p=await a.api.listar({clienteId:c.uid,limite:7,...(cursorCliente?{cursor:cursorCliente}:{})});doCliente.push(...p.itens);cursorCliente=p.proximoCursor;}while(cursorCliente);
 ok(doCliente.length===vistos.filter(p=>p.clienteId===c.uid).length&&new Set(doCliente.map(p=>p.id)).size===doCliente.length,'filtro por cliente percorre todas as páginas sem duplicatas');
 ok((await a.api.listar({clienteId:'sem-pedidos013'})).itens.length===0,'histórico vazio de um cliente não inclui terceiros');
 // Endereço legado autorizado conforme serviço original.
 await seed.doc(`lojas/${L}/clientes/${c.uid}/enderecos/legado`).set({rua:'Rua sintética',numero:'1'});
 await seed.doc(path('legado')).set({...basePedido(c.uid),enderecoId:'legado'});
 ok((await a.api.buscar('legado')).endereco.rua==='Rua sintética','fallback legado proprio estabelecimento');
 await negar(()=>getDocFromServer(ref(b,`lojas/${L}/clientes/${c.uid}/enderecos/legado`)));
 await seed.doc('usuarios/'+a.uid).update({ativo:false});
 await assert.rejects(()=>a.api.listar(),e=>e.status===403);checks++;
 await negar(()=>direto(a,'ataques','status','cancelado'));
 await seed.doc('usuarios/'+a.uid).update({ativo:true});
 console.log(JSON.stringify({adminPedidosSdk:"aprovado",checks}));
 const navegador=await verificarAdminPedidosNavegador({projectId,host,authHost,lojaId:L,email:a.email,emailCliente:c.email,emailOutraLoja:b.email,produtoId:ids[0],preparar:async uid=>seed.doc('usuarios/'+uid).set({role:'cliente',ativo:true,lojaId:L}),localizar:async()=>{const q=await seed.collection(`lojas/${L}/pedidos`).where('observacao','==','Compra navegador007').get();assert.equal(q.size,1);return {id:q.docs[0].id,...q.docs[0].data()};}});
 await writeFile(new URL('../../../docs/ADAPTACAO_SERVERLESS/ORDEM_013_PEDIDOS_EVIDENCIAS.json',import.meta.url),JSON.stringify({status:'APROVADO',sdkChecks:checks,browser:navegador,realFirebaseWrites:0,realAccountsCreated:0,realOrdersCreated:0,rulesChanged:false},null,2)+'\n');
 console.log(JSON.stringify({admin007:'aprovado_local',sdkChecks:checks,navegador,pedido50:compra.itens.length,express:false,lojaRealAlterada:false}));
}finally{await carregar("rules_version = '2'; service cloud.firestore { match /databases/{db}/documents { match /{d=**} { allow read, write: if false; } } }");for(const x of atores){await signOut(x.auth);await terminate(x.db);await deleteApp(x.app);}await seed.terminate();await admin.deleteApp(appAdmin);}
