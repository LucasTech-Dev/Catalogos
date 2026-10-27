// Restauração e bloqueio/reset exclusivamente em Emulators locais; saída sem PII.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {initializeApp,deleteApp} from 'firebase/app';import {getAuth,connectAuthEmulator,signInAnonymously,createUserWithEmailAndPassword,signOut,signInWithEmailAndPassword} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,updateDoc,terminate} from 'firebase/firestore';
import {criarServicoPedidos} from '../../../frontend/src/services/pedidos.js';
import {projetarRegistro} from '../../../frontend/src/services/projecaoPublica.js';
import {criarServicoPerfil} from '../../../frontend/src/services/perfil.js';
import {criarAdminCatalogo} from '../../../frontend/src/services/adminCatalogo.js';
const require=createRequire(import.meta.url),core=require('../../firebase/ordem012-core.cjs'),{createRequire:cr}=require('node:module'),r=cr(new URL('../../../backend/package.json',import.meta.url));
const admin=r('firebase-admin/app'),store=r('firebase-admin/firestore'),authAdmin=r('firebase-admin/auth');
const project='demo-ordem012',host=process.env.FIRESTORE_EMULATOR_HOST,authHost=process.env.FIREBASE_AUTH_EMULATOR_HOST;
assert.equal(process.env.GCLOUD_PROJECT,project);assert.equal(host,'127.0.0.1:8188');assert.equal(authHost,'127.0.0.1:9198');assert.equal(process.env.CATALOGOS_EMULATOR_EXCLUSIVO,'1');
const dir=new URL('../../../private-backups/ordem012-finalizacao-20261026/',import.meta.url),load=n=>JSON.parse(fs.readFileSync(new URL(n,dir))),backup=load('firestore.json'),authBackup=load('auth-users.json'),config=load('auth-config.json'),privateInv=load('inventory-private.json'),integrity=load('integrity.json'),preservation=load('preservation-config.json');
const app=admin.initializeApp({projectId:project},'ordem012'),dbAdmin=store.getFirestore(app),auth=authAdmin.getAuth(app),actors=[];let stage='integrity',checks=0;
const ok=(value,msg)=>{assert.ok(value,msg);checks++;};
const prefix=`projects/${project}/databases/(default)/documents`,url=`http://${host}/v1/${prefix}`;
const refs=v=>Array.isArray(v)?v.map(refs):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,k==='referenceValue'?x.replace('projects/bancorestaurante/',`projects/${project}/`):refs(x)])):v;
const localName=d=>d.name.replace('projects/bancorestaurante/',`projects/${project}/`);
async function call(suffix,method='GET',data){const result=await fetch(url+suffix,{method,headers:{Authorization:'Bearer owner','Content-Type':'application/json'},...(data?{body:JSON.stringify(data)}:{})});assert.ok(result.ok,'Emulator REST '+result.status);return result.json();}
async function restoreDocs(docs){for(let i=0;i<docs.length;i+=50)await call(':commit','POST',{writes:docs.slice(i,i+50).map(d=>({update:{name:localName(d),fields:refs(d.fields||{})}}))});}
try{
 for(const[n,entry]of Object.entries(integrity.files)){const b=fs.readFileSync(new URL(n,dir));ok(require('node:crypto').createHash('sha256').update(b).digest('hex')===entry.sha256,'checksum privado');}
 assert.equal(backup.project,'bancorestaurante');assert.ok(backup.complete&&authBackup.complete);
 stage='restore-firestore';await restoreDocs(backup.documents);
 for(const d of backup.documents){const actual=await call('/'+core.pathOf(d));ok(core.hash(actual.fields||{})===core.hash(refs(d.fields||{})),'campos/tipos recuperados');}
 stage='restore-auth';const records=authBackup.users.map(core.authImport),options=core.authHashOptions(config);const imported=await auth.importUsers(records,options);ok(imported.failureCount===0,'importação Auth sem falha');
 const restored=(await auth.listUsers(1000)).users;
 for(const source of authBackup.users){const actual=restored.find(u=>u.uid===source.localId);ok(!!actual,'UID Auth recuperado');ok((actual.email||'')===(source.email||'')&&actual.disabled===!!source.disabled,'identidade recuperada');ok(core.hash(actual.providerData.map(p=>[p.providerId,p.uid]).sort())===core.hash((source.providerUserInfo||[]).map(p=>[p.providerId,p.rawId]).sort()),'provedores recuperados');if(source.passwordHash)ok(actual.passwordHash===source.passwordHash,'hash de senha preservado');if(source.salt)ok(actual.passwordSalt===source.salt,'salt preservado');}
 stage='cleanup-and-rollback';const plan=core.plan({documents:backup.documents,users:authBackup.users,adminUid:privateInv.adminUid,includeOrphans:true});
 ok(plan.authDelete.length===18&&plan.deleteDocs.length===0,'adendo contém apenas18 anônimos');
 const manifest=load('manifest.json');ok(core.hash(plan.authDelete)===core.hash(manifest.authDelete),'alvos exatos do manifesto');
 for(const target of plan.deleteDocs)await dbAdmin.doc(target.path).delete();
 await dbAdmin.doc(core.COUNTER).set({ultimo:0});for(const uid of plan.authDelete)await auth.deleteUser(uid);
 ok((await dbAdmin.collection('lojas/loja-demo/pedidos').get()).empty,'pedidos vazios');ok((await dbAdmin.collection('lojas/loja-demo/clientes').get()).empty,'clientes vazios');
 for(const target of plan.protectedDocs){const actual=await call('/'+target.path),source=backup.documents.find(d=>core.pathOf(d)===target.path);ok(core.hash(actual.fields||{})===core.hash(refs(source.fields||{})),'recurso protegido intacto');}
 ok((await auth.getUser(privateInv.adminUid)).uid===privateInv.adminUid,'administrador preservado');
 await restoreDocs(backup.documents);const reimport=await auth.importUsers(records.filter(r=>plan.authDelete.includes(r.uid)),options);ok(reimport.failureCount===0,'Auth removido recuperado no ensaio');
 ok((await auth.listUsers(1000)).users.length===21,'18 anônimos restaurados com UID original');
 for(const target of plan.deleteDocs){const actual=await call('/'+target.path),source=backup.documents.find(d=>core.pathOf(d)===target.path);ok(core.hash(actual.fields||{})===core.hash(refs(source.fields||{})),'reversão Firestore comprovada');}
 stage='published-rules-and-counter';const body={rules:{files:preservation.rules.source.files.map(f=>({name:f.name,content:f.content}))}};const rules=await fetch(`http://${host}/emulator/v1/projects/${project}:securityRules`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.ok(rules.ok);
 const shop='ordem012-teste',loja={nome:'Loja sintética012',ativo:true,whatsapp:'5551999999999',pagamentos:{pix:true,cartao_debito:true},retirada:{habilitada:true},entrega:{habilitada:false,taxa:0},pedidoMinimo:0};
 await dbAdmin.doc('lojas/'+shop).set(loja);await dbAdmin.doc('catalogosPublicos/'+shop).set(projetarRegistro('loja',loja));await dbAdmin.doc(`lojas/${shop}/controleCompra/versao`).set({revisao:0,alteracao:null});
 for(const[collection,data]of [['categorias',{nome:'Teste',ativo:true}],['produtos',{nome:'Produto sintético',categoriaId:'p',ativo:true,disponivel:true,preco:1}]]){await dbAdmin.doc(`lojas/${shop}/${collection}/p`).set(data);await dbAdmin.doc(`catalogosPublicos/${shop}/${collection}/p`).set(projetarRegistro(collection,data));}
 async function actor(label,anonymous){const a=initializeApp({projectId:project,apiKey:'fake-api-key'},label),auth=getAuth(a),db=getFirestore(a);connectFirestoreEmulator(db,'127.0.0.1',8188);connectAuthEmulator(auth,'http://'+authHost,{disableWarnings:true});if(anonymous)await signInAnonymously(auth);else await createUserWithEmailAndPassword(auth,label+'@example.invalid','Senha-sintetica-012!');const out={a,auth,db,api:criarServicoPedidos({db,auth,sessao:async()=>auth.currentUser,lojaId:shop})};actors.push(out);return out;}
 const a=await actor('cliente012a',true),b=await actor('cliente012b',false);
 const perfil=criarServicoPerfil({db:b.db,auth:b.auth,sessao:async()=>b.auth.currentUser,lojaId:shop});await perfil.salvarPerfil({nome:'Cliente sintético',telefone:'51999999999'});ok((await perfil.buscarPerfil()).nome==='Cliente sintético','cadastro e releitura perfil persistidos');
 const customerUid=b.auth.currentUser.uid;await signOut(b.auth);await signInWithEmailAndPassword(b.auth,'cliente012b@example.invalid','Senha-sintetica-012!');ok(b.auth.currentUser.uid===customerUid,'login cliente após cadastro');
 const manager=await actor('admin012',false),adminUid=manager.auth.currentUser.uid;await dbAdmin.doc('usuarios/'+adminUid).set({role:'admin',ativo:true,lojaId:shop});await signOut(manager.auth);await signInWithEmailAndPassword(manager.auth,'admin012@example.invalid','Senha-sintetica-012!');const gate=criarAdminCatalogo({db:manager.db,auth:manager.auth,sessaoExistente:async()=>manager.auth.currentUser,lojaId:shop});ok((await gate.autorizar()).uid===adminUid,'login e autorização administrativa SDK');
 const wrong=criarAdminCatalogo({db:b.db,auth:b.auth,sessaoExistente:async()=>b.auth.currentUser,lojaId:shop});await assert.rejects(()=>wrong.autorizar(),e=>e.status===403);checks++;
 const data={itens:[{produtoId:'p',quantidade:1}],tipoEntrega:'retirada',pagamento:{forma:'cartao_debito'},cliente:{nome:'Cliente sintético',telefone:'51999999999'},observacao:''};
 await dbAdmin.doc(`lojas/${shop}/contadores/pedidos`).set({ultimo:core.LOCK});
 for(const actor of[a,b]){await assert.rejects(()=>actor.api.criarPedido(data,{chave:'bloqueio012-'+(actor===a?'a':'b')+'-000000'}),e=>e.code==='NUMERACAO_INDISPONIVEL');checks++;}
 ok((await dbAdmin.collection(`lojas/${shop}/pedidos`).get()).empty,'nenhum pedido durante bloqueio');
 await assert.rejects(()=>updateDoc(doc(a.db,`lojas/${shop}/contadores/pedidos`),{ultimo:0}),e=>e.code==='permission-denied');checks++;
 await dbAdmin.doc(`lojas/${shop}/contadores/pedidos`).set({ultimo:0});
 const results=await Promise.all([a.api.criarPedido(data,{chave:'nova-sequencia012-a-0001'}),b.api.criarPedido(data,{chave:'nova-sequencia012-b-0001'})]);
 ok(core.hash(results.map(p=>p.numeroPedido).sort())===core.hash([1,2]),'sequência concorrente 1 e2');ok(results.every(p=>p.pagamento.status==='pendente'),'débito inicia pendente');
 const retry=await a.api.criarPedido(data,{chave:'nova-sequencia012-a-0001'});ok(retry.id===results[0].id&&retry.numeroPedido===results[0].numeroPedido,'idempotência após reset');ok((await dbAdmin.collection(`lojas/${shop}/pedidos`).get()).size===2,'sem duplicação');
 const evidence={order:'012-finalizacao',manifestSha256:core.hash(load('manifest.json')),anonymousDeletedAndRestored:18,adminLoginTested:'synthetic Emulator only',customerSignupProfileLoginTested:true,status:'APROVADO',at:new Date().toISOString(),project,checks,documentsRestored:backup.documents.length,authUsersRestored:authBackup.users.length,passwordHashesRestored:authBackup.users.filter(u=>u.passwordHash).length,restoreAfterDeletion:true,publishedRulesSha256:require('node:crypto').createHash('sha256').update(preservation.rules.source.files.map(f=>f.content).join('\n')).digest('hex'),counterLock:core.LOCK,newConcurrentNumbers:results.map(p=>p.numeroPedido),remoteWrites:0,systemDocumentTimesRestored:false,liveSessionsRestored:false};
 fs.writeFileSync(new URL('../../../docs/ADAPTACAO_SERVERLESS/ORDEM_012_FINALIZACAO_EMULATOR.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));
} catch(e){console.error(JSON.stringify({status:'FALHOU',stage,code:e.code||null,checks,privateDetailsOmitted:true}));process.exitCode=1;} finally{for(const actor of actors){await terminate(actor.db);await deleteApp(actor.a);}await dbAdmin.terminate();await admin.deleteApp(app);}
