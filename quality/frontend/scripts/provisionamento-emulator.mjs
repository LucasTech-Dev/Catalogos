import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,GoogleAuthProvider,signInWithCredential,signInAnonymously} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,getDocFromServer,getDocsFromServer,collection,setDoc,updateDoc,terminate,setLogLevel} from 'firebase/firestore';
import {criarProvisionador,codificar} from '../provisionamento/emulator.mjs';
import {planejarProvisionamento,sha256} from '../provisionamento/manifesto.mjs';
import {consultarCatalogo} from '../../../frontend/src/services/catalogo.js';
import {criarAdminCatalogo} from '../../../frontend/src/services/adminCatalogo.js';
import {criarAdminGestao} from '../../../frontend/src/services/adminGestao.js';
import {criarServicoPerfil} from '../../../frontend/src/services/perfil.js';
import {criarAdminPedidos} from '../../../frontend/src/services/adminPedidos.js';
import {criarServicoPedidos} from '../../../frontend/src/services/pedidos.js';
const projetoId='demo-replicacao',firestore='127.0.0.1:8188',authHost='127.0.0.1:9198';
assert.equal(process.env.GCLOUD_PROJECT,projetoId);assert.equal(process.env.FIRESTORE_EMULATOR_HOST,firestore);assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST,authHost);assert.equal(process.env.CATALOGOS_EMULATOR_EXCLUSIVO,'1');
setLogLevel('silent');
const root=new URL('../../../',import.meta.url),checks=[],atores=[];
const config={projetoId,firestore,auth:authHost},executor=criarProvisionador(config);
const base=`http://${firestore}/v1/projects/${projetoId}/databases/(default)/documents`,headers={'Content-Type':'application/json',Authorization:'Bearer owner'};
const ok=(id,value)=>{assert.ok(value,id);checks.push(id);};
const rejeitar=async(id,fn,validar)=>{await assert.rejects(fn,validar);checks.push(id);};
const negar=(id,fn)=>rejeitar(id,fn,e=>e.code==='permission-denied');
const owner=async(caminho,dados)=>{const r=await fetch(base+'/'+caminho,{method:dados?'PATCH':'GET',headers,...(dados?{body:JSON.stringify({fields:codificar(dados).mapValue.fields})}:{})});if(r.status===404&&!dados)return null;assert.ok(r.ok,await r.clone().text());return r.json();};
async function ator(label,anonimo=false){
 const app=initializeApp({projectId:projetoId,apiKey:'fake-api-key'},label),db=getFirestore(app),auth=getAuth(app);connectFirestoreEmulator(db,'127.0.0.1',8188);connectAuthEmulator(auth,'http://'+authHost,{disableWarnings:true});
 if(anonimo)await signInAnonymously(auth);else{
  const now=Math.floor(Date.now()/1000),jwt=Buffer.from(JSON.stringify({alg:'none',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:label,email:label+'@example.invalid',email_verified:true,name:'Ator sintético',iss:'https://accounts.google.com',aud:projetoId,iat:now,exp:now+3600})).toString('base64url')+'.';
  await signInWithCredential(auth,GoogleAuthProvider.credential(jwt));
 }
 const a={app,db,auth,uid:auth.currentUser.uid};atores.push(a);a.ctx=lojaId=>({db,auth,lojaId,sessao:async()=>auth.currentUser,sessaoExistente:async()=>auth.currentUser});return a;
}
const modelo=async nome=>JSON.parse(await fs.readFile(new URL('quality/fixtures/provisionamento/'+nome+'.json',root),'utf8'));
const leitura=(ator,caminho)=>getDocFromServer(doc(ator.db,caminho));
let inicio=Date.now();
try{
 const rules=await fs.readFile(new URL('firebase/firestore.rules',root),'utf8');
 const carregar=await fetch(`http://${firestore}/emulator/v1/projects/${projetoId}:securityRules`,{method:'PUT',headers,body:JSON.stringify({rules:{files:[{name:'firestore.rules',content:rules}]}})});assert.ok(carregar.ok,await carregar.text());
 const a=await ator('admin-aurora'),b=await ator('admin-boreal'),clienteA=await ator('cliente-aurora'),clienteB=await ator('cliente-boreal'),anonimo=await ator('anonimo',true);
 const ma=await modelo('aurora'),mb=await modelo('boreal');ma.administrador.uid=a.uid;mb.administrador.uid=b.uid;
 const apiA=criarAdminCatalogo(a.ctx(ma.lojaId)),apiB=criarAdminCatalogo(b.ctx(mb.lojaId));
 await rejeitar('UID sem vínculo não administra',()=>apiA.sessao(),e=>e.status===403);
 await negar('cliente não cria próprio privilégio',()=>setDoc(doc(clienteA.db,'usuarios',clienteA.uid),{role:'admin',ativo:true,lojaId:ma.lojaId}));
 const mal=structuredClone(ma);mal.administrador.uid=anonimo.uid;
 await rejeitar('bootstrap recusa conta anônima',()=>executor.aplicar(mal));
 mal.administrador.uid='uid-nao-existente';await rejeitar('bootstrap recusa UID inexistente',()=>executor.aplicar(mal));
 const anterior=await executor.dryRun(ma);ok('dry-run novo mostra cinco caminhos',anterior.acao==='criar-atomicamente'&&anterior.plano.documentos.length===5);
 for(const d of anterior.plano.documentos)ok('dry-run não gravou '+d.caminho.split('/').slice(0,2).join('/'),await owner(d.caminho)===null);
 ok('Aurora criada atomicamente',(await executor.aplicar(ma)).gravados===5);ok('Boreal criada atomicamente',(await executor.aplicar(mb)).gravados===5);
 let backupInicial;
 if(process.env.CATALOGOS_SEED_ETAPA4==='1'){
  const {criarBackupEmulator}=await import('../provisionamento/backup-emulator.mjs');
  const config={projetoId,firestore,auth:authHost},origem=criarBackupEmulator(config),destino=criarBackupEmulator({...config,projetoId:'demo-inicial-etapa4'});backupInicial=[];
  for(const m of [ma,mb]){const snapshot=await origem.exportar(m.lojaId,[m.administrador.uid]);ok('backup inicial contém somente cinco documentos '+m.lojaId,snapshot.documentos.length===5);const restore=await destino.restaurar(snapshot);ok('backup inicial restaurado integralmente '+m.lojaId,restore.documentos===5);backupInicial.push({lojaId:m.lojaId,documentos:restore.documentos,hash:restore.hashDados});}
 }
 ok('repetição intacta não grava',(await executor.aplicar(ma)).gravados===0);
 ok('admin Aurora usa loja correta',(await apiA.sessao()).lojaId===ma.lojaId);ok('admin Boreal usa loja correta',(await apiB.sessao()).lojaId===mb.lojaId);
 for(const [m,admin] of [[ma,a],[mb,b]]){
  const vazio=await consultarCatalogo(anonimo.db,m.lojaId);ok('catálogo vazio '+m.lojaId,vazio.produtos.length===0&&vazio.categorias.length===0&&vazio.loja.nome===m.loja.nome);
  ok('contador inicial zero '+m.lojaId,(await leitura(admin,`lojas/${m.lojaId}/contadores/pedidos`)).data().ultimo===0);
  ok('revisão inicial zero '+m.lojaId,(await leitura(admin,`lojas/${m.lojaId}/controleCompra/versao`)).data().revisao===0);
  for(const tipo of ['produtos','categorias','clientes','pedidos'])ok('coleção inicialmente vazia '+m.lojaId+'/'+tipo,(await getDocsFromServer(collection(admin.db,`lojas/${m.lojaId}/${tipo}`))).empty);
 }
 for(const [ator,outra] of [[a,mb.lojaId],[b,ma.lojaId],[clienteA,mb.lojaId],[clienteB,ma.lojaId],[anonimo,ma.lojaId]]){
  await negar('configuração privada isolada '+atores.indexOf(ator),()=>leitura(ator,'lojas/'+outra));
  await negar('alteração cruzada negada '+atores.indexOf(ator),()=>updateDoc(doc(ator.db,'lojas',outra),{nome:'Tentativa cruzada'}));
 }
 await rejeitar('serviço admin A recusa loja B',()=>criarAdminCatalogo(a.ctx(mb.lojaId)).sessao(),e=>e.status===403);
 await negar('admin não muda seu vínculo',()=>updateDoc(doc(a.db,'usuarios',a.uid),{lojaId:mb.lojaId}));
 const alterado=structuredClone(ma);alterado.loja.nome='Mudança proibida de manifesto';await rejeitar('manifesto divergente preserva destino',()=>executor.aplicar(alterado));
 const reutilizado=structuredClone(mb);reutilizado.administrador.uid=a.uid;await rejeitar('não reatribui admin de outra loja',()=>executor.aplicar(reutilizado));
 // Ausência do documento pai não é ausência de dados.
 const orfa=await modelo('aurora'),adminOrfa=await ator('admin-orfa');orfa.lojaId='loja-orfa';orfa.administrador.uid=adminOrfa.uid;
 await owner('lojas/loja-orfa/pedidos/historico',{preservar:true});await rejeitar('subcoleção órfã impede seed',()=>executor.aplicar(orfa));ok('histórico órfão preservado',Boolean(await owner('lojas/loja-orfa/pedidos/historico')));
 const vazia=await modelo('aurora'),adminVazia=await ator('admin-vazia');vazia.lojaId='loja-doc-vazio';vazia.administrador.uid=adminVazia.uid;
 await owner('lojas/loja-doc-vazio',{});await rejeitar('documento vazio existente impede seed',()=>executor.dryRun(vazia));ok('documento vazio existente preservado',Boolean(await owner('lojas/loja-doc-vazio')));
 // Falha antes do commit; o mesmo manifesto pode ser retomado sem exclusão.
 const recuperar=await modelo('aurora'),adminRec=await ator('admin-recuperacao');recuperar.lojaId='loja-recuperacao';recuperar.administrador.uid=adminRec.uid;
 const antesCommit=criarProvisionador(config,{fetcher:(url,op)=>String(url).endsWith(':commit')?Promise.reject(Error('falha sintética antes do commit')):fetch(url,op)});
 await rejeitar('falha anterior gera resultado incerto',()=>antesCommit.aplicar(recuperar),e=>e.code==='PROVISIONAMENTO_INCERTO');
 for(const d of planejarProvisionamento(recuperar).documentos)ok('falha não criou '+d.caminho.split('/')[0],await owner(d.caminho)===null);
 ok('retomada após falha cria uma vez',(await executor.aplicar(recuperar)).gravados===5);
 const perdido=await modelo('boreal'),adminPerdido=await ator('admin-perdido');perdido.lojaId='loja-resposta-perdida';perdido.administrador.uid=adminPerdido.uid;
 const semResposta=criarProvisionador(config,{fetcher:async(url,op)=>{const r=await fetch(url,op);if(String(url).endsWith(':commit'))throw Error('resposta sintética perdida');return r;}});
 await rejeitar('resposta perdida não anuncia sucesso',()=>semResposta.aplicar(perdido),e=>e.code==='PROVISIONAMENTO_INCERTO');
 ok('dry-run recupera confirmação após resposta perdida',(await executor.dryRun(perdido)).estado==='ja-provisionado-intacto');ok('repetir resposta perdida não duplica',(await executor.aplicar(perdido)).gravados===0);
 const conflito=await modelo('aurora'),adminConflito=await ator('admin-conflito');conflito.lojaId='loja-conflito';conflito.administrador.uid=adminConflito.uid;
 const caminhoConflito='lojas/loja-conflito/controleCompra/versao';
 const concorrer=criarProvisionador(config,{fetcher:async(url,op)=>{if(String(url).endsWith(':commit'))await owner(caminhoConflito,{revisao:77,alteracao:null});return fetch(url,op);}});
 await rejeitar('precondição impede sobrescrita concorrente',()=>concorrer.aplicar(conflito),e=>e.code==='PROVISIONAMENTO_INCERTO');
 ok('escrita concorrente preservada',(await owner(caminhoConflito)).fields.revisao.integerValue==='77');
 for(const d of planejarProvisionamento(conflito).documentos.filter(d=>d.caminho!==caminhoConflito))ok('commit recusado não criou '+d.caminho.split('/')[0],await owner(d.caminho)===null);
 // Fluxos normais após o seed usam somente os serviços Web SDK e Rules atuais.
 const gestao=criarAdminGestao(a.ctx(ma.lojaId));await gestao.configurar({nome:'Aurora atualizada'});
 ok('configuração atualiza projeção',(await leitura(anonimo,'catalogosPublicos/'+ma.lojaId)).data().nome==='Aurora atualizada');ok('configuração incrementa revisão',(await leitura(a,`lojas/${ma.lojaId}/controleCompra/versao`)).data().revisao===1);
 for(const [api,m,preco] of [[apiA,ma,10],[apiB,mb,20]]){
  await api.salvar('categorias',null,{nome:'Categoria sintética',ativo:true},'categoria-local');
  await api.salvar('produtos',null,{nome:'Produto sintético',preco,categoriaId:'categoria-local',ativo:true,disponivel:true,ingredientes:[]},'produto-local');
 }
 const perfilA=criarServicoPerfil(clienteA.ctx(ma.lojaId)),perfilB=criarServicoPerfil(clienteB.ctx(mb.lojaId));
 await perfilA.salvarPerfil({nome:'Cliente Aurora',telefone:'51999990001'});await perfilB.salvarPerfil({nome:'Cliente Boreal',telefone:'51999990002'});
 const endereco={rua:'Rua Sintética do Cliente',numero:'2',bairro:'Centro',cidade:'Cidade Fictícia',uf:'RS'};
 const enderecoA=await perfilA.salvarEndereco(null,endereco),enderecoB=await perfilB.salvarEndereco(null,endereco);
 for(const [ator,loja,uid,id] of [[clienteA,mb.lojaId,clienteB.uid,enderecoB.id],[clienteB,ma.lojaId,clienteA.uid,enderecoA.id],[a,mb.lojaId,clienteB.uid,enderecoB.id],[b,ma.lojaId,clienteA.uid,enderecoA.id]]){
  await negar('endereço privado cruzado '+atores.indexOf(ator),()=>leitura(ator,`lojas/${loja}/clientes/${uid}/enderecos/${id}`));
  await negar('endereço cruzado não pode ser alterado '+atores.indexOf(ator),()=>updateDoc(doc(ator.db,`lojas/${loja}/clientes/${uid}/enderecos/${id}`),{rua:'Tentativa cruzada'}));
 }

 for(const [ator,loja,uid] of [[clienteA,mb.lojaId,clienteB.uid],[clienteB,ma.lojaId,clienteA.uid],[a,mb.lojaId,clienteB.uid],[b,ma.lojaId,clienteA.uid]]){
  await negar('perfil privado cruzado '+atores.indexOf(ator),()=>leitura(ator,`lojas/${loja}/clientes/${uid}`));
  await negar('perfil cruzado não pode ser alterado '+atores.indexOf(ator),()=>updateDoc(doc(ator.db,`lojas/${loja}/clientes/${uid}`),{nome:'Alteração indevida'}));
 }
 const dados={itens:[{produtoId:'produto-local',quantidade:1}],tipoEntrega:'retirada',cliente:{nome:'Cliente sintético',telefone:'51999990001'},pagamento:{forma:'dinheiro'},observacao:''};
 const pedidosA=criarServicoPedidos(clienteA.ctx(ma.lojaId)),pedidosB=criarServicoPedidos(clienteB.ctx(mb.lojaId));
 const [pa,pb]=await Promise.all([pedidosA.criarPedido(dados,{chave:'primeira-compra-0000001'}),pedidosB.criarPedido({...dados,tipoEntrega:'entrega',enderecoId:enderecoB.id},{chave:'primeira-compra-0000001'})]);
 ok('primeiro pedido #1 independente',pa.numeroPedido===1&&pb.numeroPedido===1);ok('preços próprios por loja',pa.total===10&&pb.total===27.5&&pb.taxaEntrega===7.5&&pb.endereco.rua===endereco.rua);ok('pagamento continua manual pendente',pa.pagamento.status==='pendente'&&pb.pagamento.status==='pendente');
 const repetido=await pedidosA.criarPedido(dados,{chave:'primeira-compra-0000001'});ok('idempotência não consome número',repetido.id===pa.id&&repetido.numeroPedido===1);
 const par=await Promise.all([pedidosA.criarPedido(dados,{chave:'concorrencia-loja-000001'}),pedidosA.criarPedido(dados,{chave:'concorrencia-loja-000002'})]);ok('concorrência produz #2 e #3',par.map(p=>p.numeroPedido).sort().join(',')==='2,3');ok('contador B permanece 1',(await leitura(b,`lojas/${mb.lojaId}/contadores/pedidos`)).data().ultimo===1);
 for(const [ator,loja,pedido] of [[clienteA,mb.lojaId,pb],[clienteB,ma.lojaId,pa],[a,mb.lojaId,pb],[b,ma.lojaId,pa],[anonimo,ma.lojaId,pa]]){
  await negar('pedido privado cruzado '+atores.indexOf(ator),()=>leitura(ator,`lojas/${loja}/pedidos/${pedido.id}`));
  await negar('pedido cruzado não pode ser alterado '+atores.indexOf(ator),()=>updateDoc(doc(ator.db,`lojas/${loja}/pedidos/${pedido.id}`),{status:'cancelado'}));
 }
 const financeiro=await criarAdminPedidos(a.ctx(ma.lojaId)).pagamento(pa.id,'confirmado',0);
 ok('registro financeiro permanece manual',financeiro.pagamento.status==='confirmado');
 const historia=await getDocsFromServer(collection(a.db,`lojas/${ma.lojaId}/pedidos/${pa.id}/historicoAdministrativo`));ok('histórico administrativo criado pela operação',historia.size===1);
 for(const ator of [b,clienteA,clienteB,anonimo])await negar('histórico privado protegido '+atores.indexOf(ator),()=>getDocsFromServer(collection(ator.db,`lojas/${ma.lojaId}/pedidos/${pa.id}/historicoAdministrativo`)));
 await negar('cliente não reinicia contador',()=>setDoc(doc(clienteA.db,`lojas/${ma.lojaId}/contadores/pedidos`),{ultimo:0}));await rejeitar('seed não reinicia loja em uso',()=>executor.aplicar(ma));ok('contador A permanece 3',(await leitura(a,`lojas/${ma.lojaId}/contadores/pedidos`)).data().ultimo===3);
 const receipt={status:'APROVADO',projetoId,ambiente:'Emulators exclusivos; dados e identidades sintéticos',checks:checks.map(id=>({id,aprovado:true})),totalChecks:checks.length,lojasIniciais:2,documentosPorLoja:5,primeirosNumeros:[pa.numeroPedido,pb.numeroPedido],tempoMs:Date.now()-inicio,rulesSha256:sha256(rules),indicesSha256:sha256(await fs.readFile(new URL('firebase/firestore.indexes.json',root),'utf8')),backupInicial,realFirebaseWrites:0,realAuthAccounts:0,realDeploys:0};
 await fs.writeFile(new URL('docs/ADAPTACAO_SERVERLESS/'+(process.env.CATALOGOS_SEED_ETAPA4==='1'?'ETAPA4_PROVISIONAMENTO_EMULATOR.json':process.env.CATALOGOS_PROVISIONAMENTO_REGRESSAO_ETAPA3==='1'?'ETAPA3_PROVISIONAMENTO_REGRESSAO.json':'REPLICACAO_ETAPA2_EMULATOR.json'),root),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({status:receipt.status,checks:checks.length,tempoMs:receipt.tempoMs}));
}finally{for(const a of atores){await terminate(a.db);await deleteApp(a.app);}}
