import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,createUserWithEmailAndPassword,signOut} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,collection,query,limit,getDocsFromServer,getCountFromServer,getDocFromServer,setDoc,updateDoc,deleteDoc,writeBatch,serverTimestamp,terminate} from 'firebase/firestore';
import {criarAdminCatalogo} from '../../../frontend/src/services/adminCatalogo.js';
import {projetarRegistro,salvarComProjecao} from '../../../frontend/src/services/projecaoPublica.js';
import {criarServicoPedidos} from '../../../frontend/src/services/pedidos.js';
import {verificarAdminGestaoNavegador} from './admin-gestao-browser.js';
import {criarAdminGestao} from '../../../frontend/src/services/adminGestao.js';
import {criarAdminPedidos,TRANSICOES_STATUS,TRANSICOES_PAGAMENTO} from '../../../frontend/src/services/adminPedidos.js';
const host=process.env.FIRESTORE_EMULATOR_HOST,authHost=process.env.FIREBASE_AUTH_EMULATOR_HOST;
for(const h of [host,authHost])assert.match(h || '',/^(127\.0\.0\.1|localhost):\d+$/);assert.equal(process.env.CATALOGOS_EMULATOR_EXCLUSIVO,'1');
const run=Date.now(),projectId='demo-catalogos-admin008-'+run,L='admin008-'+run,B=L+'-b';
const require=createRequire(new URL('../../../backend/package.json',import.meta.url)),admin=require('firebase-admin/app'),fsAdmin=require('firebase-admin/firestore');
const appAdmin=admin.initializeApp({projectId},'ordem008'),seed=fsAdmin.getFirestore(appAdmin),atores=[];let checks=0;
const ok=(v,m)=>{assert.ok(v,m);checks++;};
const negar=async fn=>{await assert.rejects(fn,e=>e.code==='permission-denied');checks++;};
const bloqueio=async fn=>{await assert.rejects(fn,e=>e.code==='B03_BLOQUEADO' && e.status===409);checks++;};
async function carregar(content){const r=await fetch(`http://${host}/emulator/v1/projects/${projectId}:securityRules`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{name:'firestore.rules',content}]}})});assert.ok(r.ok,await r.text());}
async function ator(tipo,loja=L){const app=initializeApp({projectId,apiKey:'fake-api-key'},'admin008-'+atores.length),db=getFirestore(app),auth=getAuth(app),[h,p]=host.split(':');connectFirestoreEmulator(db,h,Number(p));connectAuthEmulator(auth,'http://'+authHost,{disableWarnings:true});await createUserWithEmailAndPassword(auth,`${tipo}-${atores.length}-${run}@teste.local`,'Senha-local-teste-123!');const a={app,db,auth,uid:auth.currentUser.uid,email:auth.currentUser.email};atores.push(a);if(tipo==='admin')await seed.doc('usuarios/'+a.uid).set({role:'admin',ativo:true,lojaId:loja});a.catalogo=criarAdminCatalogo({db,auth,sessaoExistente:async()=>auth.currentUser,lojaId:L});a.pedidos=criarAdminPedidos({db,auth,sessaoExistente:async()=>auth.currentUser,lojaId:L});a.api=criarAdminGestao({db,auth,sessaoExistente:async()=>auth.currentUser,lojaId:L});return a;}
const ref=(x,p)=>doc(x.db,p),orig=`lojas/${L}`,pub=`catalogosPublicos/${L}`;
async function diretoLoja(ator,patch){
 const a=(await seed.doc(orig).get()).data();
 const merge=(x,y)=>{const n={...x};for(const [k,v] of Object.entries(y))n[k]=v && typeof v==='object' && !Array.isArray(v)?merge(x?.[k] && typeof x[k]==='object'?x[k]:{},v):v;return n;};
 const n=merge(a,patch),rev=(await seed.doc(orig+'/controleCompra/versao').get()).data().revisao;
 const lote=writeBatch(ator.db);lote.set(ref(ator,orig),n);lote.set(ref(ator,pub),projetarRegistro('loja',n));lote.set(ref(ator,orig+'/controleCompra/versao'),{revisao:rev+1,alteracao:{tipo:'loja',id:'loja'}});return lote.commit();
}
try{
 await carregar(await readFile(new URL('../../../firebase/firestore.rules',import.meta.url),'utf8'));
 const a=await ator('admin'),b=await ator('admin',B),c=await ator('cliente');
 const loja={nome:'Loja008',ativo:true,entrega:{habilitada:true,taxa:5,privado:'sentinela'},retirada:{habilitada:true},pagamentos:{pix:true,dinheiro:true,cartao:true,privado:'sentinela'},whatsapp:'51999999999',privado:'sentinela',endereco:{rua:'Rua comercial',numero:'1',bairro:'Centro',cidade:'Cidade',uf:'RS',complemento:'Sala1',privado:'sentinela'},horarios:{segunda:{abertura:'09:00',fechamento:'18:00',fechado:false,privado:'sentinela'}}};
 for(const l of [L,B]){await seed.doc('lojas/'+l).set(loja);await seed.doc('catalogosPublicos/'+l).set(projetarRegistro('loja',loja));}
 await seed.doc(orig+'/controleCompra/versao').set({revisao:0,alteracao:null});
 ok((await a.api.sessao()).lojaId===L,'sessao SDK de toda administracao');
 let dados=await a.api.loja();ok(!JSON.stringify(dados).includes('sentinela') && dados.pagamentos.cartao_credito,'DTO loja e cartao legado');
 for(let n=0;n<28;n++)await seed.doc(orig+'/clientes/cliente-'+String(n).padStart(2,'0')).set({nome:n?'Cliente '+n:'',email:'sintetico'+n+'@teste.local',telefone:'51999999999',anonimo:n===0});
 const p1=await a.api.listarClientes({limite:25}),p2=await a.api.listarClientes({limite:25,cursor:p1.proximoCursor});ok(p1.itens.length===25 && p2.itens.length===3 && !p2.proximoCursor && !p1.itens.some(x=>p2.itens.some(y=>y.id===x.id)),'clientes paginados porID');
 ok((await a.api.buscarCliente('cliente-00')).anonimo===true,'detalhe convidado com ausencias');
 await assert.rejects(()=>a.api.buscarCliente('ausente'),e=>e.status===404);checks++;
 await assert.rejects(()=>a.api.listarClientes({busca:'naoexistia'}),e=>e.status===400);checks++;
 for(const x of [b,c]){
  for(const op of [()=>x.api.loja(),()=>x.api.dashboard(),()=>x.api.listarClientes(),()=>x.api.buscarCliente('cliente-00'),()=>x.api.configurar({nome:'invasor'})]){await assert.rejects(op,e=>e.status===403);checks++;}
  await negar(()=>getDocFromServer(ref(x,orig)));await negar(()=>getDocsFromServer(collection(x.db,orig+'/clientes')));
  await negar(()=>getDocFromServer(ref(x,orig+'/clientes/cliente-00')));
  await negar(()=>salvarComProjecao(x.db,L,'loja',null,{nome:'invasor'}));
  await negar(()=>getCountFromServer(collection(x.db,orig+'/pedidos')));
 }
 await negar(()=>updateDoc(ref(a,orig+'/clientes/cliente-00'),{role:'admin'}));
 await negar(()=>getDocFromServer(ref(a,'usuarios/'+c.uid))); // não consulta autoridade de terceiros
 const cat=await a.catalogo.salvar('categorias',null,{nome:'Categoria008'}),ids=[];
 for(let n=0;n<50;n++)ids.push((await a.catalogo.salvar('produtos',null,{nome:'Produto'+n,categoriaId:cat.id,preco:10,ativo:true,disponivel:true})).id);
 const cli=criarServicoPedidos({db:c.db,auth:c.auth,sessao:async()=>c.auth.currentUser,lojaId:L});
 const body={itens:ids.map(produtoId=>({produtoId,quantidade:1})),tipoEntrega:'retirada',cliente:{nome:'Cliente teste',telefone:'51999999999'},pagamento:{forma:'pix'},observacao:'Pedido008'};
 const pedido=await cli.criarPedido(body,{chave:`compra50-008-${run}`});ok(pedido.itens.length===50 && pedido.total===500,'pedido real50');
 await a.pedidos.pagamento(pedido.id,'confirmado',0);
 const cancelado=await cli.criarPedido({...body,itens:body.itens.slice(0,1)},{chave:`cancelado008-${run}`});await a.pedidos.pagamento(cancelado.id,'confirmado',0);await a.pedidos.status(cancelado.id,'cancelado',1);
 const pendente=await cli.criarPedido({...body,itens:body.itens.slice(0,1)},{chave:`pendente008-${run}`});
 const hoje=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 await seed.doc(orig+'/pedidos/fora-periodo').set({...pedido,criadoEm:new Date(hoje+'T00:00:00-03:00')});await seed.doc(orig+'/pedidos/fora-periodo').update({criadoEm:new Date(new Date(hoje+'T00:00:00-03:00').getTime()-1)});
 await seed.doc(orig+'/produtos/legado-sem-disponivel').set({ativo:true});await seed.doc(orig+'/produtos/inativo').set({ativo:false});await seed.doc(orig+'/produtos/indisponivel').set({ativo:true,disponivel:false});
 const dash=await a.api.dashboard({inicio:hoje,fim:hoje});ok(dash.pedidos===3 && dash.valorPedidos===520 && dash.valorPagamentosConfirmados===500,'dashboard historico exclui cancelado do confirmado');
 ok(dash.porStatus.recebido===2 && dash.porStatus.cancelado===1 && dash.recentes.length===3,'status e recentes porperiodo');ok(dash.produtos.disponiveis===51 && dash.produtos.indisponiveis===2,'disponibilidade legado original');
 for(const op of [{inicio:'2026-02-30'},{inicio:'2026-01-01',fim:'2026-02-02'},{inicio:'2026-10-24',fim:'2026-10-23'}]){await assert.rejects(()=>a.api.dashboard(op),e=>e.status===400);checks++;}
 const antes=(await getDocFromServer(ref(a,orig+'/controleCompra/versao'))).data().revisao;
 dados=await a.api.configurar({nome:'Loja editada008',descricao:'Duas\nlinhas',whatsapp:'(51) 98888-7777',telefone:'51999999999',instagram:'@sintetico',logo:'https://example.test/logo.png',imagem:'https://example.test/imagem.jpg',corPrimaria:'#123abc',tempoMedio:'30min',endereco:{rua:'Rua nova',uf:'rs'},horarios:{segunda:{fechamento:'19:00'}},pagamentos:{pix:false},entrega:{taxa:8.5},pedidoMinimo:15});
 ok(dados.nome==='Loja editada008' && dados.whatsapp==='5551988887777' && dados.endereco.complemento==='Sala1','info publica e preservacao endereco');
 ok(dados.horarios.segunda.abertura==='09:00' && dados.horarios.segunda.fechamento==='19:00','merge horario original');
 ok(dados.pagamentos.cartao_credito && dados.pagamentos.cartao_debito && !dados.pagamentos.pix,'cartao legado expandido sem desligar implicitamente');
 const canonical=(await seed.doc(orig).get()).data(),publico=(await getDocFromServer(ref(c,pub))).data();ok(canonical.privado==='sentinela' && canonical.endereco.privado==='sentinela' && canonical.horarios.segunda.privado==='sentinela','privados preservados origem');
 ok(!JSON.stringify(publico).includes('sentinela') && publico.nome===dados.nome && publico.entrega.taxa===8.5 && publico.horarios.segunda==='09:00 às 19:00','projecao atomica minima');
 ok((await getDocFromServer(ref(a,orig+'/controleCompra/versao'))).data().revisao===antes+1,'revisao comercial exatamente+1');
 ok((await a.pedidos.buscar(pedido.id)).total===500 && (await cli.buscarPedido(pedido.id)).pagamento.valor===500,'pedidos historicos preservados');
 const link=await cli.finalizarPedido(pedido.id);const u=new URL(link.url),msg=u.searchParams.get('text');ok(u.pathname==='/5551988887777' && msg.includes('500,00') && msg.includes('#'+pedido.numeroPedido) && !msg.includes(pedido.id),'WhatsApp usa configuracao nova e total persistido');
 await assert.rejects(()=>cli.finalizarPedido(cancelado.id));checks++;
 await a.pedidos.pagamento(pendente.id,'recusado',0);await a.pedidos.status(pendente.id,'pagamento_recusado',1);await assert.rejects(()=>cli.finalizarPedido(pendente.id));checks++;
 const invalidos=[{nome:''},{whatsapp:'x'},{logo:'javascript:alert(1)'},{logo:'https://user:senha@example.test/x'},{corPrimaria:'vermelho'},{pedidoMinimo:-1},{entrega:{taxa:1.001}},{entrega:{habilitada:false},retirada:{habilitada:false}},{pagamentos:{pix:false,dinheiro:false,cartao_credito:false,cartao_debito:false}},{horarios:{segunda:{abertura:'24:00'}}},{horarios:{segunda:{fechamento:'09:00'}}},{endereco:{uf:'XX'}},{privado:'x'},{pagamentos:{segredo:'x'}},{endereco:{privado:'x'}}];
 for(const patch of invalidos){await assert.rejects(()=>a.api.configurar(patch),e=>e.status===400);checks++;await negar(()=>diretoLoja(a,patch));}
 await negar(()=>updateDoc(ref(a,orig),{nome:'isolado'}));await negar(()=>updateDoc(ref(a,pub),{nome:'isolado'}));
 await negar(()=>salvarComProjecao(a.db,L,'loja',null,{horarios:{segunda:{privado:'novo'}}}));
 await a.api.configurar({pagamentos:{pix:true},pedidoMinimo:0});
 const pos=await cli.criarPedido({...body,pagamento:{forma:'pix'}},{chave:`apos008-${run}`});ok(pos.itens.length===50 && pos.total===500,'pedido50 apos config');
 await a.api.configurar({pedidoMinimo:600});await assert.rejects(()=>cli.criarPedido(body,{chave:`minimo008-${run}`}),e=>e.code==='COMPRA_REVISAR');checks++;
 await a.api.configurar({pedidoMinimo:0});
 await seed.doc(pub).update({whatsapp:'invalido'});await assert.rejects(()=>cli.finalizarPedido(pedido.id));checks++;await a.api.configurar({nome:'Loja editada008'});
 // B-04: semana completa em etapas, cada origem/projeção/revisão atômica.
 const semana=Object.fromEntries(['segunda','terca','quarta','quinta','sexta','sabado','domingo'].map(dia=>[dia,{abertura:'09:00',fechamento:'18:00',fechado:false}]));
 const completa=await a.api.configurar({horarios:semana});
 ok(completa.salvamento.atomico===false && completa.salvamento.diasConfirmados.length===7,'B04 semana salva em etapas confirmadas');
 const fonte=(await seed.doc(orig).get()).data(),projecao=(await seed.doc(pub).get()).data();
 ok(Object.keys(semana).every(d=>fonte.horarios[d].abertura==='09:00' && projecao.horarios[d]==='09:00 às 18:00'),'B04 sete dias consistentes');
 const aposHorarios=await cli.criarPedido({...body,pagamento:{forma:'pix'}},{chave:`aposHorarios008-${run}`});ok(aposHorarios.itens.length===50 && aposHorarios.total===500,'pedido50 após sete dias');
 console.log(JSON.stringify({adminGestaoSdk:'aprovado_B04_em_etapas',checks,pedido50:50,express:false}));
 const navegador=await verificarAdminGestaoNavegador({projectId,host,authHost,lojaId:L,email:a.email,emailCliente:c.email,emailOutraLoja:b.email,forcarFalha:async()=>{const r=await readFile(new URL('../../../firebase/firestore.rules',import.meta.url),'utf8');await carregar(r.replace('&& loja_comercial_valida()',"&& loja_comercial_valida() && request.resource.data.get('horarios',{}).get('quarta',{}).get('abertura','') != '11:00'"));},restaurarRegras:async()=>carregar(await readFile(new URL('../../../firebase/firestore.rules',import.meta.url),'utf8')),conferir:async()=>({origem:(await seed.doc(orig).get()).data(),publico:(await seed.doc(pub).get()).data()})});
 console.log(JSON.stringify({admin008:'local_B04_em_etapas',sdkChecks:checks,navegador,express:false,lojaRealAlterada:false}));
}finally{await carregar("rules_version = '2'; service cloud.firestore { match /databases/{db}/documents { match /{d=**} { allow read, write: if false; } } }");for(const x of atores){await signOut(x.auth);await terminate(x.db);await deleteApp(x.app);}await seed.terminate();await admin.deleteApp(appAdmin);}
