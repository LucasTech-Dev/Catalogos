const assert=require('node:assert/strict');
const crypto=require('node:crypto');
require('../src/config/ambiente').validarAmbiente();
assert.ok(process.env.GCLOUD_PROJECT?.startsWith('demo-'));
for(const key of ['FIREBASE_AUTH_EMULATOR_HOST','FIRESTORE_EMULATOR_HOST'])assert.match(process.env[key] || '',/^(localhost|127\.0\.0\.1):\d+$/);
const {identity}=require('./publico-emulator-integration');
const app=require('../src/app');
const {getFirestore}=require('firebase-admin/firestore');
const {getAuth}=require('firebase-admin/auth');
let checks=0;
async function main() {
  const db=getFirestore(),auth=getAuth(),lojaId='erros-'+crypto.randomUUID(),loja=db.collection('lojas').doc(lojaId);
  await loja.set({nome:'Loja erros',ativo:true,pagamentos:{pix:true},retirada:{habilitada:true}});
  await loja.collection('produtos').doc('produto').set({nome:'Produto',preco:20,ativo:true});
  const cliente=await identity('signUp',{}),outro=await identity('signUp',{});
  const email='erros-'+crypto.randomUUID()+'@teste.local',password='Senha-local-123!';
  const user=await auth.createUser({email,password});await db.collection('usuarios').doc(user.uid).set({ativo:true,role:'admin',lojaId});const admin=await identity('signInWithPassword',{email,password});
  const server=await new Promise(resolve=>{const server=app.listen(0,'127.0.0.1',()=>resolve(server));});
  const base='http://127.0.0.1:'+server.address().port,orders='/lojas/'+lojaId+'/pedidos';
  async function request(method,path,token,body,status,chave) {
    const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...(chave?{'Idempotency-Key':chave}:{}),'X-Request-ID':'sentinela-controlada'},body:body===undefined?undefined:JSON.stringify(body)});
    const dados=await r.json();assert.equal(r.status,status,method+' '+path);assert.match(r.headers.get('X-Request-ID'),/^[\da-f-]{36}$/i);
    assert.doesNotMatch(JSON.stringify(dados),/sentinela|stack|PRIVATE KEY|backend\//);checks++;return dados;
  }
  const logger=console.error,logs=[];console.error=value=>logs.push(value);
  try {
    await request('GET','/ausente?senha=sentinela',null,undefined,404);
    await request('GET',orders,null,undefined,401);await request('GET',orders,'invalido',undefined,401);
    await request('GET',orders,cliente.idToken,undefined,200);
    const originalAuth=auth.verifyIdToken;
    try {
      for(const [code,status] of [['auth/network-request-failed',503],['auth/internal-error',500],['auth/id-token-expired',401],['auth/id-token-revoked',401],['auth/user-not-found',401]]) {
        auth.verifyIdToken=async()=>{throw Object.assign(new Error('senha=sentinela token=sentinela'),{code});};
        await request('GET',orders,cliente.idToken,undefined,status);
      }
    }finally{auth.verifyIdToken=originalAuth;}
    const collectionOriginal=db.collection;
    try {db.collection=function(nome){if(nome==='usuarios')throw Object.assign(new Error('cliente=sentinela'),{code:14});return collectionOriginal.call(this,nome);};await request('GET',orders,cliente.idToken,undefined,503);}finally{db.collection=collectionOriginal;}
    await request('GET',orders,cliente.idToken,undefined,200);
    const corpo={tipoEntrega:'retirada',itens:[{produtoId:'produto',quantidade:1}],pagamento:{forma:'pix'}};
    const originalTx=db.runTransaction;
    // Falha após preparar todas as escritas, antes do commit real: atomicidade do SDK.
    try {db.runTransaction=function(fn){return originalTx.call(this,async tx=>{await fn(tx);throw Object.assign(new Error('sentinela'),{code:10});});};await request('POST',orders,cliente.idToken,corpo,503,crypto.randomUUID());}finally{db.runTransaction=originalTx;}
    assert.equal((await loja.collection('pedidos').get()).size,0);assert.equal((await loja.collection('idempotencia').get()).size,0);
    // Commit concluído, mas resposta perdida: repetir mesmo nonce recupera o registro.
    const chave=crypto.randomUUID();let perdeu=false;
    try {db.runTransaction=async function(fn){const resultado=await originalTx.call(this,fn);if(!perdeu){perdeu=true;throw Object.assign(new Error('resposta perdida sentinela'),{code:14});}return resultado;};await request('POST',orders,cliente.idToken,corpo,503,chave);}finally{db.runTransaction=originalTx;}
    const salvo=await request('POST',orders,cliente.idToken,corpo,201,chave);
    assert.equal((await loja.collection('pedidos').get()).size,1);assert.equal((await loja.collection('idempotencia').get()).size,1);assert.equal(salvo.total,20);
    await request('POST',orders,cliente.idToken,{...corpo,observacao:'Outro corpo'},409,chave);
    await request('GET',orders+'/finalizacao/'+chave,cliente.idToken,undefined,200);
    await request('GET',orders+'/'+salvo.id,outro.idToken,undefined,404);
    await request('PATCH',orders+'/'+salvo.id+'/pagamento',cliente.idToken,{status:'confirmado'},403);
    await request('GET',orders+'/'+salvo.id+'/whatsapp',cliente.idToken,undefined,400);
    assert.equal((await loja.collection('pedidos').doc(salvo.id).get()).data().pagamento.status,'pendente');
    // Falha transacional financeira antes do commit não confirma pagamento.
    try {db.runTransaction=function(fn){return originalTx.call(this,async tx=>{await fn(tx);throw Object.assign(new Error('sentinela financeira'),{code:14});});};await request('PATCH',orders+'/'+salvo.id+'/pagamento',admin.idToken,{status:'confirmado'},503);}finally{db.runTransaction=originalTx;}
    assert.equal((await loja.collection('pedidos').doc(salvo.id).get()).data().pagamento.status,'pendente');
    await request('PATCH',orders+'/'+salvo.id+'/pagamento',admin.idToken,{status:'confirmado'},200);
    await request('PATCH',orders+'/'+salvo.id+'/pagamento',admin.idToken,{status:'pendente'},400);
    assert.doesNotMatch(logs.join(''),/sentinela|senha|token|PRIVATE KEY|\/home\//);
    for(const log of logs){const data=JSON.parse(log);assert.match(data.requestId,/^[\da-f-]{36}$/i);assert.ok(data.status>=500);}
  }finally{console.error=logger;await new Promise(resolve=>server.close(resolve));await db.terminate();}
  console.log(`Etapa 23 Emulator: ${checks} verificações HTTP reais; Auth/Firestore temporários vs credenciais, recuperação após falha, abort antes de commit, resposta perdida após commit, nonce, financeiro, WhatsApp e logs seguros aprovados.`);
}
main().catch(()=>{console.error('Falha na integração local da Etapa 23.');process.exit(1);});
