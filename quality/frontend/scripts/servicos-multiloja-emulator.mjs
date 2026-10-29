// Etapa3: mesmos serviços da aplicação; somente projeto e identidades sintéticos.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInAnonymously,GoogleAuthProvider,signInWithCredential,linkWithCredential,confirmPasswordReset} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,getDocFromServer,getDocsFromServer,collection,updateDoc,setDoc,disableNetwork,enableNetwork,terminate,setLogLevel} from 'firebase/firestore';
import {criarProvisionador,codificar} from '../provisionamento/emulator.mjs';
import {sha256} from '../provisionamento/manifesto.mjs';
import {criarServicoConta} from '../../../frontend/src/services/autenticacao.js';
import {criarServicoPerfil} from '../../../frontend/src/services/perfil.js';
import {criarServicoPedidos} from '../../../frontend/src/services/pedidos.js';
import {criarAdminCatalogo} from '../../../frontend/src/services/adminCatalogo.js';
import {criarAdminGestao} from '../../../frontend/src/services/adminGestao.js';
import {criarAdminPedidos} from '../../../frontend/src/services/adminPedidos.js';
import {consultarCatalogo} from '../../../frontend/src/services/catalogo.js';
const root=new URL('../../../',import.meta.url),project='demo-replicacao',host='127.0.0.1:8188',authHost='127.0.0.1:9198';
assert.equal(process.env.GCLOUD_PROJECT,project);assert.equal(process.env.FIRESTORE_EMULATOR_HOST,host);assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST,authHost);assert.equal(process.env.CATALOGOS_EMULATOR_EXCLUSIVO,'1');
setLogLevel('silent');
const atores=[],checks=[],inicio=Date.now(),base=`http://${host}/v1/projects/${project}/databases/(default)/documents`,headers={'Content-Type':'application/json',Authorization:'Bearer owner'};
const ok=(id,v)=>{assert.ok(v,id);checks.push(id);};
const rejeitar=async(id,fn,validar)=>{await assert.rejects(fn,validar);checks.push(id);};
const negar=(id,fn)=>rejeitar(id,fn,e=>e.code==='permission-denied');
const ler=(a,p)=>getDocFromServer(doc(a.db,p));
const owner=async(p,dados)=>{const r=await fetch(base+'/'+p,{method:dados?'PATCH':'GET',headers,...(dados?{body:JSON.stringify({fields:codificar(dados).mapValue.fields})}:{})});assert.ok(r.ok,'operação interna de fixture');return r.json();};
function credencial(label){const now=Math.floor(Date.now()/1000);return GoogleAuthProvider.credential(Buffer.from(JSON.stringify({alg:'none',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:label,email:label+'@example.invalid',email_verified:true,name:'Identidade sintética',iss:'https://accounts.google.com',aud:project,iat:now,exp:now+3600})).toString('base64url')+'.');}
async function ator(label,modo='sem-login'){
 const app=initializeApp({projectId:project,apiKey:'fake-api-key'},label),auth=getAuth(app),db=getFirestore(app);connectAuthEmulator(auth,'http://'+authHost,{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8188);
 if(modo==='google')await signInWithCredential(auth,credencial(label));if(modo==='anonimo')await signInAnonymously(auth);
 const a={app,auth,db,label,ctx:lojaId=>({db,auth,lojaId,sessao:async()=>auth.currentUser,sessaoExistente:async()=>auth.currentUser})};atores.push(a);return a;
}
const dados=(patch={})=>({itens:[{produtoId:'produto-igual',quantidade:1}],tipoEntrega:'retirada',cliente:{nome:'Cliente Sintético',telefone:'51999990001'},pagamento:{forma:'dinheiro'},observacao:'Sem sal',...patch});
try {
 const rules=await fs.readFile(new URL(process.env.CATALOGOS_RULES_PUBLICADAS_ETAPA5==='1'?'quality/fixtures/firestore-publicadas-etapa5.rules':'firebase/firestore.rules',root),'utf8');
 const r=await fetch(`http://${host}/emulator/v1/projects/${project}:securityRules`,{method:'PUT',headers,body:JSON.stringify({rules:{files:[{name:'firestore.rules',content:rules}]}})});assert.ok(r.ok,'Rules locais carregadas');
 const adminA=await ator('admin-a','google'),adminB=await ator('admin-b','google'),ca=await ator('cliente-a','anonimo'),cb=await ator('cliente-b'),anon=await ator('convidado','anonimo'),visitante=await ator('sem-login');
 const ma=JSON.parse(await fs.readFile(new URL('quality/fixtures/provisionamento/aurora.json',root),'utf8')),mb=JSON.parse(await fs.readFile(new URL('quality/fixtures/provisionamento/boreal.json',root),'utf8'));ma.administrador.uid=adminA.auth.currentUser.uid;mb.administrador.uid=adminB.auth.currentUser.uid;mb.loja.pagamentos.pix=true;
 const prov=criarProvisionador({projetoId:project,firestore:host,auth:authHost});await prov.aplicar(ma);await prov.aplicar(mb);
 const A=ma.lojaId,B=mb.lojaId,perfilA=criarServicoPerfil(ca.ctx(A)),perfilB=criarServicoPerfil(cb.ctx(B)),contaA=criarServicoConta({auth:ca.auth,salvarPerfil:perfilA.salvarPerfil}),contaB=criarServicoConta({auth:cb.auth,salvarPerfil:perfilB.salvarPerfil});
 const uidAnon=ca.auth.currentUser.uid;
 const criar=contaA.cadastrar({nome:'Cliente A',telefone:'51999990001',email:'cliente-a@example.invalid',senha:'Senha-sintetica-123!'});
 await rejeitar('cadastro duplicado simultâneo é bloqueado',()=>contaA.cadastrar({nome:'Cliente A',email:'cliente-a@example.invalid',senha:'Senha-sintetica-123!'}),/outra operação/);await criar;
 ok('cadastro vincula anônimo sem duplicar UID',ca.auth.currentUser.uid===uidAnon&&!ca.auth.currentUser.isAnonymous);
 await contaB.cadastrar({nome:'Cliente B',telefone:'51999990002',email:'cliente-b@example.invalid',senha:'Senha-sintetica-456!'});const uidB=cb.auth.currentUser.uid;
 await contaA.sair();ok('logout confirmado',ca.auth.currentUser===null);await contaA.entrar('cliente-a@example.invalid','Senha-sintetica-123!');ok('novo login mantém conta e perfil',(await perfilA.buscarPerfil()).nome==='Cliente A'&&ca.auth.currentUser.uid===uidAnon);
 await contaA.trocarSenha('Senha-sintetica-123!','Senha-sintetica-nova!');await contaA.sair();await contaA.entrar('cliente-a@example.invalid','Senha-sintetica-nova!');ok('troca de senha mantém UID',ca.auth.currentUser.uid===uidAnon);
 await contaB.recuperar('cliente-b@example.invalid');
 const codes=await (await fetch(`http://${authHost}/emulator/v1/projects/${project}/oobCodes`)).json(),codigo=codes.oobCodes.find(c=>c.email==='cliente-b@example.invalid'&&c.requestType==='PASSWORD_RESET');assert.ok(codigo,'reset existe somente no Emulator');
 await confirmPasswordReset(cb.auth,codigo.oobCode,'Senha-sintetica-reset!');await contaB.sair();await contaB.entrar('cliente-b@example.invalid','Senha-sintetica-reset!');ok('recuperação de senha mantém conta existente',cb.auth.currentUser.uid===uidB);
 const google=await ator('google-convidado','anonimo'),uidGoogle=google.auth.currentUser.uid,cred=credencial('google-local-cliente');await linkWithCredential(google.auth.currentUser,cred);await criarServicoConta({auth:google.auth}).sair();await signInWithCredential(google.auth,cred);ok('Google sintético vincula e reutiliza conta',google.auth.currentUser.uid===uidGoogle);
 const catA=criarAdminCatalogo(adminA.ctx(A)),catB=criarAdminCatalogo(adminB.ctx(B)),gestA=criarAdminGestao(adminA.ctx(A)),gestB=criarAdminGestao(adminB.ctx(B));
 for(const [a,loja] of [[adminA,B],[adminB,A],[ca,A],[cb,B],[anon,A]])await rejeitar('gate admin isolado '+a.label,()=>criarAdminCatalogo(a.ctx(loja)).sessao(),e=>[401,403].includes(e.status));
 await negar('usuário não autenticado não vê dados privados',()=>ler(visitante,'lojas/'+A));await negar('cliente não cria papel admin',()=>setDoc(doc(ca.db,'usuarios',uidAnon),{role:'admin',lojaId:A,ativo:true}));
 for(const [cat,id,preco] of [[catA,A,10],[catB,B,20]]){
  await cat.salvar('categorias',null,{nome:'Categoria '+id,ativo:true},'categoria-igual');
  const item={nome:'Produto '+id,preco,categoriaId:'categoria-igual',ativo:true,disponivel:true,ingredientes:['Ingrediente '+id],imagem:'https://example.invalid/'+id+'.png'};
  const antes=(await owner(`lojas/${id}/controleCompra/versao`)).fields.revisao.integerValue;
  const primeira=cat.salvar('produtos',null,item,'produto-igual'),segunda=cat.salvar('produtos',null,item,'produto-igual');
  await rejeitar('criação simultânea divergente é recusada '+id,()=>cat.salvar('produtos',null,{...item,preco:preco+1},'produto-igual'),e=>e.code==='ADMIN_CRIACAO_CONFLITO');
  const resultado=await Promise.all([primeira,segunda]);
  ok('criação duplicada idempotente '+id,resultado[0].id===resultado[1].id&&Number((await owner(`lojas/${id}/controleCompra/versao`)).fields.revisao.integerValue)===Number(antes)+1);
 }
 const [pubA,pubB]=await Promise.all([consultarCatalogo(visitante.db,A),consultarCatalogo(visitante.db,B)]);ok('mesmo ID usa conteúdo e preço da própria loja',pubA.produtos[0].preco===10&&pubB.produtos[0].preco===20&&pubA.produtos[0].nome!==pubB.produtos[0].nome);
 await catB.salvar('produtos',null,{nome:'Somente B',preco:30,categoriaId:'categoria-igual'},'somente-b');
 const comprarA=criarServicoPedidos(ca.ctx(A)),comprarB=criarServicoPedidos(cb.ctx(B)),comprarAnon=criarServicoPedidos(anon.ctx(A));
 await rejeitar('produto exclusivo B não é comprado em A',()=>comprarA.criarPedido(dados({itens:[{produtoId:'somente-b',quantidade:1}]}),{chave:'produto-de-outra-loja-0001'}));
 await rejeitar('preço fornecido pelo cliente é recusado',()=>comprarA.criarPedido({...dados(),total:1},{chave:'total-adulterado-00000001'}),e=>e.status===400);
 await rejeitar('pagamento de B não habilitado em A é recusado',()=>comprarA.criarPedido(dados({pagamento:{forma:'pix'}}),{chave:'pagamento-invalido-000001'}));
 await catA.salvar('produtos','produto-igual',{disponivel:false});await rejeitar('produto indisponível não pode ser comprado',()=>comprarA.criarPedido(dados(),{chave:'produto-indisponivel-00001'}));await catA.salvar('produtos','produto-igual',{disponivel:true});
 await gestA.configurar({pedidoMinimo:25});await rejeitar('mínimo da própria loja não pode ser ignorado',()=>comprarA.criarPedido(dados(),{chave:'minimo-nao-atendido-00001'}));ok('mínimo A não alterou B',(await gestB.loja()).pedidoMinimo===0);await gestA.configurar({pedidoMinimo:0});
 ok('falhas comerciais não consumiram #1',(await ler(adminA,`lojas/${A}/contadores/pedidos`)).data().ultimo===0);
 const endereco={rua:'Rua Sintética',numero:'1',bairro:'Centro',cidade:'Cidade Fictícia',uf:'RS'},ea=await perfilA.salvarEndereco(null,endereco),eb=await perfilB.salvarEndereco(null,{...endereco,rua:'Rua Boreal'});
 await perfilA.salvarEndereco(ea.id,{...endereco,numero:'2'});ok('edição de endereço não afeta B',(await perfilB.listarEnderecos())[0].rua==='Rua Boreal');
 await rejeitar('entrega habilitada somente em B não pode ser usada em A',()=>comprarA.criarPedido(dados({tipoEntrega:'entrega',enderecoId:ea.id}),{chave:'entrega-indisponivel-00001'}));
 const [pa,pb]=await Promise.all([comprarA.criarPedido(dados(),{chave:'primeira-compra-simultanea'}),comprarB.criarPedido(dados({tipoEntrega:'entrega',enderecoId:eb.id,pagamento:{forma:'pix'}}),{chave:'primeira-compra-simultanea'})]);ok('numeração #1 e valores independentes',pa.numeroPedido===1&&pb.numeroPedido===1&&pa.total===10&&pb.total===27.5);ok('ambos pagamentos iniciam pendentes',pa.pagamento.status==='pendente'&&pb.pagamento.status==='pendente');ok('PIX somente na loja B usa configuração própria',pb.pagamento.forma==='pix'&&pa.pagamento.forma==='dinheiro');
 const par=await Promise.all([comprarA.criarPedido(dados(),{chave:'concorrencia-local-000001'}),comprarAnon.criarPedido(dados(),{chave:'concorrencia-local-000002'})]);ok('compras concorrentes recebem #2/#3',par.map(p=>p.numeroPedido).sort().join(',')==='2,3');
 ok('anonimo tem histórico somente próprio',(await comprarAnon.listarPedidos()).length===1);ok('cliente B tem histórico próprio',(await comprarB.listarPedidos()).length===1);
 const salvo=await comprarB.criarPedido(dados(),{chave:'resposta-perdida-local-001'});let perdeu=false;try{throw Error('resposta local perdida após commit');}catch{perdeu=true;}
 const retomado=await comprarB.recuperarPedido('resposta-perdida-local-001');ok('resposta perdida é recuperada sem novo pedido',perdeu&&retomado.id===salvo.id&&retomado.numeroPedido===2);ok('repetição idempotente não consome sequência',(await comprarB.criarPedido(dados(),{chave:'resposta-perdida-local-001'})).numeroPedido===2);
 await disableNetwork(ca.db);await rejeitar('leitura offline falha com mensagem compreensível',()=>comprarA.buscarPedido(pa.id),e=>e.status===503);await rejeitar('compra offline preserva intenção para retomada',()=>comprarA.criarPedido(dados(),{chave:'compra-offline-local-0001'}),e=>e.status===503&&e.code==='COMPRA_INCERTA');await enableNetwork(ca.db);ok('reconexão recupera o pedido original',(await comprarA.recuperarPedido('primeira-compra-simultanea')).id===pa.id);
 const admPedidosA=criarAdminPedidos(adminA.ctx(A)),admPedidosB=criarAdminPedidos(adminB.ctx(B));await admPedidosA.pagamento(pa.id,'confirmado',0);await admPedidosA.status(pa.id,'pagamento_confirmado',1);ok('cliente vê status operacional e financeiro atuais',(await comprarA.buscarPedido(pa.id)).status==='pagamento_confirmado'&&(await comprarA.buscarPedido(pa.id)).pagamento.origem==='manual_estabelecimento');
 ok('admin B não foi afetado pelo pagamento A',(await admPedidosB.buscar(pb.id)).pagamento.status==='pendente');ok('histórico registra operações da própria loja',(await admPedidosA.historico(pa.id)).length===2);
 const [dashA,dashB]=await Promise.all([gestA.dashboard(),gestB.dashboard()]);ok('dashboard e financeiro são isolados',dashA.pedidos===3&&dashB.pedidos===2&&dashA.valorPagamentosConfirmados===10&&dashB.valorPagamentosConfirmados===0);ok('pedidos recentes têm loja correta',dashA.recentes.every(p=>p.lojaId===A)&&dashB.recentes.every(p=>p.lojaId===B));
 const clientesA=await gestA.listarClientes(),clientesB=await gestB.listarClientes();ok('clientes administrativos são isolados',clientesA.itens.every(c=>c.nome==='Cliente A')&&clientesB.itens.every(c=>c.nome==='Cliente B'));
 for(const [a,outra,uid,pedido,enderecoId] of [[adminA,B,uidB,pb,eb.id],[adminB,A,uidAnon,pa,ea.id],[ca,B,uidB,pb,eb.id],[cb,A,uidAnon,pa,ea.id],[anon,B,uidB,pb,eb.id],[visitante,A,uidAnon,pa,ea.id]]){
  for(const path of [`lojas/${outra}/clientes/${uid}`,`lojas/${outra}/clientes/${uid}/enderecos/${enderecoId}`,`lojas/${outra}/pedidos/${pedido.id}`]){
   await negar('leitura privada cruzada '+a.label+'/'+path.split('/')[2],()=>ler(a,path));await negar('gravação cruzada '+a.label+'/'+path.split('/')[2],()=>updateDoc(doc(a.db,path),{nome:'Tentativa negada'}));
  }
  await negar('histórico privado protegido '+a.label,()=>getDocsFromServer(collection(a.db,`lojas/${outra}/pedidos/${pedido.id}/historicoAdministrativo`)));
 }
 await gestA.configurar({whatsapp:'5551999990001',instagram:'@aurora-sintetica',endereco:{rua:'Rua Aurora'},horarios:{segunda:{fechado:false,abertura:'08:00',fechamento:'18:00'}}});
 ok('configurações A não alteram B',(await gestB.loja()).whatsapp===mb.loja.whatsapp&&(await gestB.loja()).horarios.segunda.fechado===true);
 const waA=new URL((await comprarA.finalizarPedido(pa.id)).url),waB=new URL((await comprarB.finalizarPedido(pb.id)).url);ok('WhatsApp usa número e identidade da própria loja',waA.pathname==='/5551999990001'&&waB.pathname==='/'+mb.loja.whatsapp&&waA.searchParams.get('text').includes(ma.loja.nome)&&!waA.searchParams.get('text').includes(mb.loja.nome));
 await catA.salvar('produtos','produto-igual',{preco:12,ingredientes:['Novo ingrediente'],imagem:'https://example.invalid/nova.png'});ok('edição de produto não muda snapshot do pedido',(await comprarA.buscarPedido(pa.id)).itens[0].precoUnitario===10);ok('edição de preço/ingredientes/imagem não afeta B',(await catB.buscar('produtos','produto-igual')).preco===20&&(await catB.buscar('produtos','produto-igual')).ingredientes[0].startsWith('Ingrediente'));
 await catA.excluir('produtos','produto-igual');ok('remoção é lógica e histórico permanece',(await catA.buscar('produtos','produto-igual')).ativo===false&&(await comprarA.buscarPedido(pa.id)).itens.length===1);await catA.salvar('produtos','produto-igual',{ativo:true,disponivel:true});
 let b03;try{await catA.salvar('categorias','categoria-igual',{ativo:false});b03='desativacao-local-permitida';ok('categoria desativada oculta produtos',(await consultarCatalogo(visitante.db,A)).produtos.length===0);await catA.salvar('categorias','categoria-igual',{ativo:true});}catch(e){assert.equal(e.status,409);b03='desativacao-bloqueada-pelas-rules';checks.push('B03 recusado sem contorno');}
 await rejeitar('exclusão física de categoria continua bloqueada',()=>catA.excluir('categorias','categoria-igual'),e=>e.code==='B03_BLOQUEADO');
 const antesUid=adminA.auth.currentUser.uid;await owner('usuarios/'+antesUid,{role:'admin',ativo:false,lojaId:A});await rejeitar('revogação não usa cache de permissão',()=>catA.sessao(),e=>e.status===403);await owner('usuarios/'+antesUid,{role:'admin',ativo:true,lojaId:A});ok('restabelecimento local revalida autoridade',(await catA.sessao()).lojaId===A);
 const mudarLojaDoPedido=async lojaId=>{const r=await fetch(base+`/lojas/${A}/pedidos/${pa.id}?updateMask.fieldPaths=lojaId`,{method:'PATCH',headers,body:JSON.stringify({fields:{lojaId:{stringValue:lojaId}}})});assert.ok(r.ok,'fixture de contrato do pedido');};
 await mudarLojaDoPedido(B);try{await rejeitar('dashboard recusa pedido com lojaId inconsistente',()=>gestA.dashboard(),e=>e.status===409);}finally{await mudarLojaDoPedido(A);}
 const apaga=await perfilA.salvarEndereco(null,{...endereco,numero:'9'});await perfilA.excluirEndereco(apaga.id);ok('exclusão de endereço próprio mantém B',(await perfilB.listarEnderecos()).length===1);
 ok('Etapa2 continua recusando seed de loja em uso',await prov.dryRun(ma).then(()=>false,()=>true));
 let homologacao; if(process.env.CATALOGOS_ETAPA4==='1')homologacao=await (await import('./homologacao-etapa4.mjs')).homologar({adminA,adminB,ca,cb,anon,visitante,ma,mb,pa,pb,catA,catB,gestA,gestB,comprarA,comprarB,perfilA,perfilB,admPedidosA,admPedidosB,ok,negar});
 const receipt={status:'APROVADO',project,checks:checks.map(id=>({id,aprovado:true})),totalChecks:checks.length,tempoMs:Date.now()-inicio,b03,homologacao,primeirosNumeros:[pa.numeroPedido,pb.numeroPedido],rulesSha256:sha256(rules),indicesSha256:sha256(await fs.readFile(new URL('firebase/firestore.indexes.json',root),'utf8')),realFirebaseWrites:0,realAuthAccounts:0,realMessages:0,deploys:0};await fs.writeFile(new URL(process.env.CATALOGOS_RULES_PUBLICADAS_ETAPA5==='1'?'docs/ADAPTACAO_SERVERLESS/ETAPA5_RULES_PUBLICADAS_EMULATOR.json':process.env.CATALOGOS_ETAPA4==='1'?'docs/ADAPTACAO_SERVERLESS/ETAPA4_HOMOLOGACAO_EMULATOR.json':'docs/ADAPTACAO_SERVERLESS/ETAPA3_SERVICOS_EMULATOR.json',root),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({status:receipt.status,checks:checks.length,b03,tempoMs:receipt.tempoMs}));
}finally{for(const a of atores){await terminate(a.db);await deleteApp(a.app);}}
