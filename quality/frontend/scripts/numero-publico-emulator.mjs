import {verificarNumeroMobile} from './numero-publico-browser.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInAnonymously,createUserWithEmailAndPassword} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,getDocFromServer,setDoc,updateDoc,writeBatch,serverTimestamp,terminate} from 'firebase/firestore';
import {criarServicoPedidos} from '../../../frontend/src/services/pedidos.js';
import {projetarRegistro} from '../../../frontend/src/services/projecaoPublica.js';
import {criarAdminPedidos} from '../../../frontend/src/services/adminPedidos.js';
const project='demo-numero-publico',host=process.env.FIRESTORE_EMULATOR_HOST,authHost=process.env.FIREBASE_AUTH_EMULATOR_HOST;
assert.equal(process.env.GCLOUD_PROJECT,project);assert.equal(host,'127.0.0.1:8188');assert.equal(authHost,'127.0.0.1:9198');
const require=createRequire(new URL('../../../backend/package.json',import.meta.url)),admin=require('firebase-admin/app'),store=require('firebase-admin/firestore');
const appAdmin=admin.initializeApp({projectId:project}),seed=store.getFirestore(appAdmin),actors=[];let checks=0;const ok=(v,msg)=>{assert.ok(v,msg);checks++;};
const rules=async file=>{const r=await fetch(`http://${host}/emulator/v1/projects/${project}:securityRules`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{name:'firestore.rules',content:fs.readFileSync(new URL(file,import.meta.url),'utf8')}]}})});assert.ok(r.ok,await r.text());};
const deny=async fn=>{await assert.rejects(fn,e=>e.code==='permission-denied');checks++;};
async function actor(label,anonymous=true){const app=initializeApp({projectId:project,apiKey:'fake-api-key'},label),db=getFirestore(app),auth=getAuth(app);connectFirestoreEmulator(db,'127.0.0.1',8188);connectAuthEmulator(auth,'http://'+authHost,{disableWarnings:true});if(anonymous)await signInAnonymously(auth);else await createUserWithEmailAndPassword(auth,label+'@example.invalid','Senha-sintetica-123!');const a={app,db,auth,uid:auth.currentUser.uid};actors.push(a);a.api=lojaId=>criarServicoPedidos({db,auth,sessao:async()=>auth.currentUser,lojaId});return a;}
const shop={nome:'Loja sintética',ativo:true,whatsapp:'5551995310123',pagamentos:{pix:true},retirada:{habilitada:true},entrega:{habilitada:true,taxa:5},pedidoMinimo:0};
const dados=(n=1,entrega=false)=>({itens:Array.from({length:n},(_,i)=>({produtoId:'p'+i,quantidade:1})),tipoEntrega:entrega?'entrega':'retirada',cliente:{nome:'Cliente sintético',telefone:'51999999999'},pagamento:{forma:'pix'},observacao:''});
const read=(a,p)=>getDocFromServer(doc(a.db,p));
try{
 await rules('../../../firebase/firestore.rules');
 for(const loja of ['a','b']){
  await seed.doc('lojas/'+loja).set(shop);await seed.doc('catalogosPublicos/'+loja).set(projetarRegistro('loja',shop));await seed.doc(`lojas/${loja}/controleCompra/versao`).set({revisao:0,alteracao:null});
  await seed.doc(`lojas/${loja}/categorias/cat`).set({nome:'Lanches',ativo:true});await seed.doc(`catalogosPublicos/${loja}/categorias/cat`).set(projetarRegistro('categorias',{nome:'Lanches',ativo:true}));
  for(let i=0;i<50;i++){const p={nome:'Produto '+i,categoriaId:'cat',ativo:true,disponivel:true,preco:1};await seed.doc(`lojas/${loja}/produtos/p${i}`).set(p);await seed.doc(`catalogosPublicos/${loja}/produtos/p${i}`).set(projetarRegistro('produtos',p));}
 }
 const a=await actor('anonimo'),b=await actor('cliente',false),c=await actor('admin',false),d=await actor('outro-admin',false);
 await seed.doc('usuarios/'+c.uid).set({role:'admin',ativo:true,lojaId:'a'});await seed.doc('usuarios/'+d.uid).set({role:'admin',ativo:true,lojaId:'b'});
 const results=await Promise.all([a.api('a').criarPedido(dados(),{chave:'simultaneo-anonimo-0001'}),b.api('a').criarPedido(dados(),{chave:'simultaneo-cliente-0001'})]);
 ok(new Set(results.map(p=>p.numeroPedido)).size===2,'números simultâneos distintos');ok(results.every(p=>[1,2].includes(p.numeroPedido)),'sequência inicia em 1 por loja');
 for(let i=0;i<2;i++){const p=results[i],actor=i?b:a;ok((await read(actor,`lojas/a/pedidos/${p.id}`)).data().numeroPedido===p.numeroPedido,'número persistido');ok((await read(actor,`lojas/a/numerosPedidos/${p.numeroPedido}`)).data().pedidoId===p.id,'reserva pertence ao pedido');}
 const repeat=await a.api('a').criarPedido(dados(),{chave:'simultaneo-anonimo-0001'});ok(repeat.id===results[0].id && repeat.numeroPedido===results[0].numeroPedido,'idempotência preserva número');ok((await seed.doc('lojas/a/contadores/pedidos').get()).data().ultimo===2,'repetir não consome sequência');
 const pb=await b.api('b').criarPedido(dados(),{chave:'mesma-chave-outra-loja-1'});ok(pb.numeroPedido===1,'sequência isolada por loja');
 const endereco={rua:'Rua fictícia',numero:'1',bairro:'Centro',cidade:'Porto Alegre',uf:'RS'};
 const entrega=await b.api('a').criarPedido(dados(1,true),{chave:'entrega-numero-0000001',endereco});ok(entrega.numeroPedido===3 && entrega.total===6,'entrega com número e valores canônicos');
 const large=await a.api('a').criarPedido(dados(50),{chave:'cinquenta-itens-0000001'});ok(large.numeroPedido===4 && large.itens.length===50 && large.total===50,'50 itens com Rules completas');
 await deny(()=>updateDoc(doc(a.db,`lojas/a/pedidos/${results[0].id}`),{numeroPedido:99}));await deny(()=>updateDoc(doc(c.db,`lojas/a/pedidos/${results[0].id}`),{numeroPedido:99}));
 await deny(()=>updateDoc(doc(a.db,'lojas/a/contadores/pedidos'),{ultimo:5}));await deny(()=>setDoc(doc(a.db,'lojas/a/numerosPedidos/5'),{numeroPedido:5,pedidoId:results[0].id,clienteId:a.uid}));
 await deny(()=>read(b,`lojas/a/pedidos/${results[0].id}`));await deny(()=>read(d,`lojas/a/pedidos/${results[0].id}`));await deny(()=>updateDoc(doc(a.db,`lojas/a/numerosPedidos/${results[0].numeroPedido}`),{pedidoId:pb.id}));
 const apiAdmin=criarAdminPedidos({db:c.db,auth:c.auth,lojaId:'a',sessaoExistente:async()=>c.auth.currentUser});ok((await apiAdmin.buscar(results[0].id)).numeroPedido===results[0].numeroPedido,'admin vê mesmo número');ok((await apiAdmin.listar({numeroPedido:results[0].numeroPedido})).itens[0].id===results[0].id,'busca administrativa pelo número');
 const old={...(await seed.doc(`lojas/a/pedidos/${results[0].id}`).get()).data()};delete old.numeroPedido;await seed.doc('lojas/a/pedidos/historico-sem-numero').set(old);ok((await a.api('a').buscarPedido('historico-sem-numero')).numeroPedido===undefined,'histórico sem migração permanece acessível');
 const extra=[];for(let round=0;round<3;round++){const par=await Promise.all([a.api('a').criarPedido(dados(),{chave:'corrida-anonimo-00000'+round}),b.api('a').criarPedido(dados(),{chave:'corrida-cliente-00000'+round})]);ok(par[0].numeroPedido!==par[1].numeroPedido,'rodada concorrente '+round);extra.push(...par.map(p=>p.numeroPedido));}
 ok(new Set(extra).size===6,'sem colisões nas repetições');
 // Duas criações com o mesmo número na mesma operação devem falhar atomicamente.
 const template=(await seed.doc(`lojas/a/clientes/${a.uid}/tentativasCompra/simultaneo-anonimo-0001`).get()).data();
 const original=(await seed.doc(`lojas/a/pedidos/${results[0].id}`).get()).data();
 const falsos=[];for(let i=0;i<2;i++){const chave='duplicidade-numero-0000'+i,id=('e'+i).repeat(32),draft={...template,marcador:id,assinatura:'a'.repeat(64)};await seed.doc(`lojas/a/clientes/${a.uid}/tentativasCompra/${chave}`).set(draft);falsos.push({chave,id,draft});}
 const ultimo=(await seed.doc('lojas/a/contadores/pedidos').get()).data().ultimo,proximo=ultimo+1,lote=writeBatch(a.db);
 for(const f of falsos){lote.set(doc(a.db,'lojas/a/pedidos/'+f.id),{...original,numeroPedido:proximo,operacaoCompra:f.chave,criadoEm:serverTimestamp(),atualizadoEm:serverTimestamp()});lote.set(doc(a.db,'lojas/a/idempotencia/'+f.id),{clienteId:a.uid,lojaId:'a',pedidoId:f.id,assinatura:f.draft.assinatura});}
 lote.set(doc(a.db,'lojas/a/contadores/pedidos'),{ultimo:proximo});lote.set(doc(a.db,'lojas/a/numerosPedidos/'+proximo),{numeroPedido:proximo,pedidoId:falsos[0].id,clienteId:a.uid});await deny(()=>lote.commit());ok((await seed.doc('lojas/a/contadores/pedidos').get()).data().ultimo===ultimo,'ataque não avança contador');ok(!(await seed.doc('lojas/a/pedidos/'+falsos[0].id).get()).exists,'ataque não cria parcialmente');
 const browser=await verificarNumeroMobile({project,host,authHost,email:b.auth.currentUser.email,adminEmail:c.auth.currentUser.email,contarPedidos:async()=>(await seed.collection('lojas/a/pedidos').get()).size});
 const antesContrato=(await seed.collection('lojas/a/pedidos').get()).size;
 await rules('../../fixtures/firestore-antes-numero-publico.rules');
 await assert.rejects(()=>a.api('a').criarPedido(dados(),{chave:'rules-publicadas-000001'}));checks++;ok((await seed.collection('lojas/a/pedidos').get()).size===antesContrato,'Rules anteriores não aceitam contrato novo nem criam pedido parcial');
 await rules('../../../firebase/firestore.rules');
 const out={status:'APROVADO',checks,browser,concurrentNumbers:results.map(p=>p.numeroPedido),oldRulesDenyNewContract:true,realFirebaseWrites:0,realAccountsCreated:0,realOrdersCreated:0};fs.writeFileSync(new URL('../../../docs/ADAPTACAO_SERVERLESS/NUMERO_PUBLICO_EMULATOR_EVIDENCIAS.json',import.meta.url),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
}finally{for(const a of actors){await terminate(a.db);await deleteApp(a.app);}await seed.terminate();await admin.deleteApp(appAdmin);}
