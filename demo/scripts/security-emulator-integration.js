import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,signInWithEmailAndPassword,signInAnonymously} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,doc,collection,getDoc,getDocs,setDoc,updateDoc,deleteDoc,terminate} from 'firebase/firestore';
const require=createRequire(import.meta.url);
process.env.GCLOUD_PROJECT ||= 'demo-catalogos-emulator';
for(const key of ['FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST'])assert.match(process.env[key] || '',/^(localhost|127\.0\.0\.1):\d+$/);
assert.ok(process.env.GCLOUD_PROJECT.startsWith('demo-'));
const {request,identity}=require('../../backend/scripts/publico-emulator-integration');
const backendRequire=createRequire(new URL('../../backend/src/app.js',import.meta.url));
const adminDb=backendRequire('firebase-admin/firestore').getFirestore();
const adminAuth=backendRequire('firebase-admin/auth').getAuth();
const suffix=crypto.randomUUID(),lojaId='seguranca-'+suffix,loja=adminDb.doc('lojas/'+lojaId),pub='/publico/lojas/'+lojaId,orders='/lojas/'+lojaId+'/pedidos',administracao='/admin/lojas/'+lojaId;
const apps=[];let negacoes=0,apiChecks=0;
async function status(method,path,token,body,expected,chave){const r=await request(method,path,token,body,chave);assert.equal(r.status,expected,method+' '+path+' '+JSON.stringify(r.body));apiChecks++;return r;}
async function actor(nome,role) {
  const app=initializeApp({projectId:process.env.GCLOUD_PROJECT,apiKey:'fake-key',authDomain:'localhost'},nome+'-'+suffix);apps.push(app);
  const auth=getAuth(app);connectAuthEmulator(auth,'http://'+process.env.FIREBASE_AUTH_EMULATOR_HOST,{disableWarnings:true});
  const firestore=getFirestore(app),[host,port]=process.env.FIRESTORE_EMULATOR_HOST.split(':');connectFirestoreEmulator(firestore,host,Number(port));
  let user,token;
  if(nome!=='visitante') {
    if(nome==='anonimo')user=(await signInAnonymously(auth)).user;
    else {const password='Senha-local-123!',email=nome+'-'+suffix+'@teste.local';await adminAuth.createUser({email,password});user=(await signInWithEmailAndPassword(auth,email,password)).user;}
    if(role)await adminDb.doc('usuarios/'+user.uid).set({role:'admin',lojaId:role==='outra'?'outra-'+suffix:lojaId,ativo:true});
    token=await user.getIdToken();
  }
  return {nome,app,auth,firestore,user,token};
}
async function main(){
  await loja.set({nome:'Loja segura',ativo:true,whatsapp:'11999999999',pagamentos:{pix:true},retirada:{habilitada:true},entrega:{habilitada:true,taxa:7},segredo:'sentinela-privada'});
  await loja.collection('categorias').doc('cat').set({nome:'Categoria',ativo:true});
  await loja.collection('produtos').doc('produto').set({nome:'Produto',categoriaId:'cat',preco:20,ativo:true,ingredientes:['Pão',{segredo:'sentinela-privada'}]});
  await loja.collection('produtos').doc('rascunho').set({nome:'Rascunho privado',ativo:false,preco:99});
  const actors=await Promise.all([actor('visitante'),actor('cliente'),actor('outroCliente'),actor('anonimo'),actor('admin','mesma'),actor('outroAdmin','outra')]);
  const [visitor,customer,other,anon,admin,otherAdmin]=actors;
  const addr=await status('POST',pub+'/me/enderecos',customer.token,{rua:'Rua privada',numero:'10',bairro:'Centro',cidade:'SP',uf:'SP'},201);
  const body={tipoEntrega:'retirada',itens:[{produtoId:'produto',quantidade:1,precoUnitario:0}],clienteId:other.user.uid,cliente:{nome:'Cliente privado',telefone:'11999999999'},pagamento:{forma:'pix'},total:0,taxaEntrega:0,desconto:0};
  const chave=crypto.randomUUID();
  const parallel=await Promise.all(Array.from({length:5},()=>status('POST',orders,customer.token,body,201,chave)));
  const order=parallel[0].body;assert.equal(new Set(parallel.map(r=>r.body.id)).size,1);assert.equal(order.total,20);assert.equal(order.clienteId,customer.user.uid);assert.equal(order.pagamento.status,'pendente');assert.equal((await loja.collection('pedidos').get()).size,1);
  await adminDb.doc('usuarios/'+customer.user.uid).set({role:'cliente',lojaId,ativo:true,senha:'sentinela-privada'});
  await loja.collection('clientes').doc(customer.user.uid).set({nome:'Cliente privado',senha:'sentinela-privada'},{merge:true});
  await loja.collection('pedidos').doc(order.id).update({'pagamento.token':'sentinela-privada','endereco.senha':'sentinela-privada'});
  const paths=['lojas/'+lojaId,'lojas/'+lojaId+'/produtos/produto','lojas/'+lojaId+'/categorias/cat','lojas/'+lojaId+'/clientes/'+customer.user.uid,'lojas/'+lojaId+'/clientes/'+customer.user.uid+'/enderecos/'+addr.body.id,'lojas/'+lojaId+'/pedidos/'+order.id,'usuarios/'+customer.user.uid,'lojas/'+lojaId+'/idempotencia/chave','lojas/'+lojaId+'/financeiro/config','desconhecida/teste'];
  for(const path of paths)await adminDb.doc(path).set({probe:true},{merge:true}); // Admin bypass intencional, somente dados fictícios.
  for(const a of actors)for(const path of paths){
    const ref=doc(a.firestore,path);
    for(const [operation,run] of [['read',()=>getDoc(ref)],['list',()=>getDocs(collection(a.firestore,path.split('/').slice(0,-1).join('/')))],['create',()=>setDoc(doc(a.firestore,path+'-novo'),{probe:true})],['update',()=>updateDoc(ref,{probe:false})],['delete',()=>deleteDoc(ref)]]){
      await assert.rejects(run(),e=>e.code==='permission-denied',a.nome+' '+operation+' '+path);negacoes++;
    }
  }
  assert.equal((await adminDb.doc('desconhecida/teste').get()).data().probe,true,'Admin SDK ignora Rules; API precisa controlar autorização.');
  const catalog=await status('GET',pub+'/catalogo',null,undefined,200);assert.ok(!JSON.stringify(catalog.body).includes('sentinela-privada'));assert.ok(!JSON.stringify(catalog.body).includes('Rascunho privado'));
  for(const a of [visitor,customer,anon,otherAdmin])await status('GET',administracao+'/sessao',a.token,undefined,a===visitor?401:403);
  await status('GET',administracao+'/sessao',admin.token,undefined,200);
  for(const [method,path,data] of [['GET','/dashboard'],['GET','/clientes'],['POST','/produtos',{nome:'Roubo'}],['PATCH','/loja',{nome:'Roubo'}],['DELETE','/categorias/cat']])await status(method,administracao+path,otherAdmin.token,data,403);
  for(const a of [other,anon])for(const tail of ['', '/whatsapp'])await status('GET',orders+'/'+order.id+tail,a.token,undefined,404);
  const recovered=await status('GET',orders+'/finalizacao/'+chave,customer.token,undefined,200);assert.equal(recovered.body.id,order.id);assert.ok(!JSON.stringify(recovered.body).includes('sentinela-privada'));
  await status('GET',orders+'/finalizacao/'+chave,other.token,undefined,404);
  for(const endpoint of [pub+'/me','/usuarios/me',administracao+'/clientes/'+customer.user.uid]){const r=await status('GET',endpoint,endpoint.startsWith('/admin')?admin.token:customer.token,undefined,200);assert.ok(!JSON.stringify(r.body).includes('sentinela-privada'));}
  await status('PUT',pub+'/me',customer.token,{role:'admin',ativo:true,lojaId},400);
  await status('POST',orders,customer.token,{...body,desconto:999},400,crypto.randomUUID());
  await status('PATCH',orders+'/'+order.id+'/pagamento',customer.token,{status:'confirmado'},403);
  await status('POST',orders,other.token,{...body,tipoEntrega:'entrega',enderecoId:addr.body.id},400,crypto.randomUUID());
  await status('POST',orders,customer.token,{...body,pagamento:{forma:'pix',status:'confirmado'}},400,crypto.randomUUID());
  await status('GET','/publico/lojas/'+encodeURIComponent(lojaId+'/clientes/'+customer.user.uid)+'/catalogo',null,undefined,400);
  await status('GET',orders, 'invalido',undefined,401);
  const pieces=customer.token.split('.'),payload=JSON.parse(Buffer.from(pieces[1],'base64url'));payload.exp=1;pieces[1]=Buffer.from(JSON.stringify(payload)).toString('base64url');
  await status('GET',orders,pieces.join('.'),undefined,401);
  await adminDb.doc('usuarios/'+admin.user.uid).update({ativo:'false'});await status('GET',administracao+'/sessao',admin.token,undefined,403);
  await adminDb.doc('usuarios/'+admin.user.uid).update({ativo:false});await status('GET',administracao+'/sessao',admin.token,undefined,403);
  // Auth Emulator tokens have second resolution; revocation time must exceed auth_time.
  await adminAuth.updateUser(other.user.uid,{disabled:true});await status('GET',orders,other.token,undefined,401);
  console.log(`Etapa 21: ${negacoes} negativas reais do SDK Web (6 atores × 10 caminhos × 5 operações); ${apiChecks} verificações HTTP; Admin bypass, projeções, sessão expirada/desativada, BOLA, escopo, idempotência e preços aprovados.`);
  for(const a of actors)await terminate(a.firestore);for(const app of apps)await deleteApp(app);await adminDb.terminate();
}
main().catch(e=>{console.error('Falha na auditoria local:',e.message);process.exit(1);});
