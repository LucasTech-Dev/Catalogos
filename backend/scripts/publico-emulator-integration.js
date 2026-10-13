const assert = require('node:assert/strict');
const crypto = require('node:crypto');
process.env.GCLOUD_PROJECT ||= 'demo-catalogos-emulator';
for (const key of ['FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST']) {
  if (!/^(localhost|127\.0\.0\.1):\d+$/.test(process.env[key] || '')) throw new Error('Teste exige emuladores locais.');
}
if (!process.env.GCLOUD_PROJECT.startsWith('demo-')) throw new Error('Teste exige projeto demo-.');
const app = require('../src/app');
const {getFirestore} = require('firebase-admin/firestore');
const {getAuth} = require('firebase-admin/auth');
const {Readable,Writable} = require('node:stream');
const http = require('node:http');
function request(method,path,token,body,chave) {
  return new Promise(resolve => {
    const json = body === undefined ? '' : JSON.stringify(body);
    const req = new Readable({read() {if (json) this.push(json);this.push(null);}});
    req.method = method;req.url = path;req.headers = {};
    if (json) {req.headers['content-type']='application/json';req.headers['content-length']=Buffer.byteLength(json);}
    if (token) req.headers.authorization = `Bearer ${token}`;
    if (chave) req.headers['idempotency-key'] = chave;
    const res = new http.ServerResponse(req), chunks=[];
    res.assignSocket(new Writable({write(chunk,encoding,cb) {chunks.push(Buffer.from(chunk));cb();}}));
    res.on('finish',() => {const raw = Buffer.concat(chunks).toString().split('\r\n\r\n')[1];resolve({status:res.statusCode,body:raw ? JSON.parse(raw) : null});});
    app.handle(req,res);
  });
}
async function identity(operation, body) {
  const res = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:${operation}?key=fake-api-key`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,returnSecureToken:true})});
  const data = await res.json();assert.equal(res.status,200,JSON.stringify(data.error));return data;
}
async function main() {
  const db=getFirestore(),lojaId='loja-publico-'+crypto.randomUUID(),rota='/lojas/'+lojaId+'/pedidos',publico='/publico/lojas/'+lojaId;
  const loja = db.collection('lojas').doc(lojaId);
  await loja.set({nome:'Loja teste público',ativo:true,whatsapp:'51995310123',pagamentos:{pix:true,dinheiro:true,cartao_credito:true,cartao_debito:true},entrega:{habilitada:true,taxa:7},retirada:{habilitada:true},segredoAdmin:'nao-publicar'});
  await loja.collection('categorias').doc('cat').set({nome:'Categoria real',ativo:true});
  await loja.collection('produtos').doc('produto').set({nome:'Produto real',preco:12.50,ativo:true,categoriaId:'cat'});
  const anon=await identity('signUp',{}),outro=await identity('signUp',{});
  const email=`cliente-${crypto.randomUUID()}@teste.local`,password=`Senha-${crypto.randomUUID()}1!`;
  const cadastrado=await identity('signUp',{email,password});const login=await identity('signInWithPassword',{email,password});
  assert.equal(cadastrado.localId,login.localId);
  const catalogo=await request('GET',publico+'/catalogo');assert.equal(catalogo.status,200);assert.equal(catalogo.body.produtos[0].preco,12.5);assert.equal(catalogo.body.loja.segredoAdmin,undefined);
  assert.equal((await request('GET',rota)).status,401);assert.equal((await request('GET',rota,'invalido')).status,401);
  const endereco=await request('POST',publico+'/me/enderecos',anon.idToken,{rua:'Rua Teste',numero:'10',bairro:'Centro',cidade:'São Paulo',uf:'SP'});assert.equal(endereco.status,201);
  const perfil=await request('PUT',publico+'/me',login.idToken,{nome:'Cliente real',telefone:'11999999999'});assert.equal(perfil.status,200);
  assert.equal((await request('GET',publico+'/me',login.idToken)).body.nome,'Cliente real');
  const corpo={clienteId:outro.localId,tipoEntrega:'entrega',enderecoId:endereco.body.id,taxaEntrega:0,itens:[{produtoId:'produto',quantidade:2,precoUnitario:0}],cliente:{nome:'Visitante',telefone:'11999999999'},pagamento:{forma:'pix'}};
  const chave=crypto.randomUUID();
  const concorrentes=await Promise.all(Array.from({length:5},()=>request('POST',rota,anon.idToken,corpo,chave)));
  for (const resposta of concorrentes) {assert.equal(resposta.status,201);assert.equal(resposta.body.total,32);assert.equal(resposta.body.clienteId,anon.localId);assert.equal(resposta.body.pagamento.status,'pendente');}
  assert.equal(new Set(concorrentes.map(r=>r.body.id)).size,1);
  const pedido=concorrentes[0].body;
  assert.equal((await loja.collection('pedidos').get()).size,1);
  assert.equal((await request('GET',rota,outro.idToken)).body.length,0);
  for (const suffix of ['', '/whatsapp']) assert.equal((await request('GET',rota+'/'+pedido.id+suffix,outro.idToken)).status,404);
  const whatsapp=await request('GET',rota+'/'+pedido.id+'/whatsapp',anon.idToken);assert.equal(whatsapp.status,200);assert.match(whatsapp.body.url,/^https:\/\/wa\.me\/\d+\?text=/);assert.match(whatsapp.body.mensagem,/Visitante/);
  await request('PUT',publico+'/me/enderecos/'+endereco.body.id,anon.idToken,{rua:'Outra rua',numero:'20',bairro:'Bairro',cidade:'São Paulo',uf:'SP'});
  assert.match((await request('GET',rota+'/'+pedido.id+'/whatsapp',anon.idToken)).body.mensagem,/Rua Teste/);
  assert.equal((await request('PUT',publico+'/me/enderecos/'+endereco.body.id,outro.idToken,{rua:'Roubo',numero:'1',bairro:'Centro',cidade:'SP',uf:'SP'})).status,404);
  assert.equal((await request('GET',`/lojas/${lojaId}/clientes/${anon.localId}/enderecos`,outro.idToken)).status,403);
  assert.equal((await request('PATCH',rota+'/'+pedido.id+'/pagamento',anon.idToken,{status:'confirmado'})).status,403);
  for (const forma of ['dinheiro','cartao_credito','cartao_debito']) {
    const res=await request('POST',rota,login.idToken,{tipoEntrega:'retirada',itens:[{produtoId:'produto',quantidade:1}],pagamento:{forma}},crypto.randomUUID());
    assert.equal(res.status,201);assert.equal(res.body.total,12.5);assert.equal(res.body.taxaEntrega,0);
  }
  const admin=await getAuth().createUser({email:`admin-${crypto.randomUUID()}@teste.local`,password});
  await db.collection('usuarios').doc(admin.uid).set({role:'admin',lojaId,ativo:true});
  const adminLogin=await identity('signInWithPassword',{email:admin.email,password});
  assert.equal((await request('GET',rota,adminLogin.idToken)).body.length,4);
  assert.equal((await request('PATCH',rota+'/'+pedido.id+'/pagamento',adminLogin.idToken,{status:'confirmado'})).status,200);
  assert.equal((await request('GET',`/lojas/outra-loja/pedidos`,adminLogin.idToken)).status,403);
  await loja.collection('produtos').doc('produto').update({ativo:false});
  assert.equal((await request('POST',rota,anon.idToken,corpo,chave)).body.id,pedido.id);
  assert.equal((await request('POST',rota,anon.idToken,{...corpo,observacao:'novo'},chave)).status,400);
  assert.equal((await request('POST',rota,anon.idToken,corpo,crypto.randomUUID())).status,400);
  const direto=await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${process.env.GCLOUD_PROJECT}/databases/(default)/documents/lojas/${lojaId}`,{headers:{Authorization:`Bearer ${anon.idToken}`}});
  assert.equal(direto.status,403,'Security Rules precisam bloquear acesso direto.');
  console.log('Etapa 19: catálogo, cadastro/login, convidado, endereço, concorrência, quatro pagamentos, retirada/entrega, WhatsApp, isolamento, admin e Security Rules aprovados.');
  await db.terminate();
}
module.exports={request,identity};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
