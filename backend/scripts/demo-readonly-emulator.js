const assert=require('node:assert/strict');
const ambiente=require('../src/config/ambiente').validarAmbiente();
if(!ambiente.emulador || !ambiente.projectId.startsWith('demo-'))throw new Error('Teste exige apenas emuladores locais.');
require('../src/config/firebase');
const db=require('firebase-admin/firestore').getFirestore();
const {criarAppDemo,CATALOGO}=require('../src/demo/app');
async function main(){
 const dados={
  'lojas/loja-demo':{nome:'Loja Emulator',ativo:true,email:'sentinela-privada'},
  'lojas/loja-demo/categorias/c06':{nome:'Categoria',ativo:true},
  'lojas/loja-demo/produtos/p06':{nome:'Produto Emulator',preco:12,categoriaId:'c06',ativo:true,disponivel:true,interno:'sentinela-privada'},
  'lojas/outra-demo':{nome:'Loja privada',ativo:true}
 };
 // Escritas de fixtures SOMENTE no projeto demo- emulado. O app recebe capacidade get-only.
 for(const [path,data] of Object.entries(dados))await db.doc(path).set(data);
 const antes=await Promise.all(Object.keys(dados).map(async p=>(await db.doc(p).get()).data()));
 let leituras=0;
 const leitura={doc(path){assert.ok(path.startsWith('lojas/loja-demo'));return {get(){leituras++;return db.doc(path).get();}};}};
 // A fábrica de app é a mesma do runtime; guardas de produção continuam recusando Emulator.
 const config={lojaId:'loja-demo',aprovado:true,produtos:['p06'],categorias:['c06']};
 const app=criarAppDemo(config,()=>leitura,{CORS_ORIGINS:'https://catalogo-demo-cz1.pages.dev',RATE_LIMIT_MODE:'enforce'});
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  assert.equal((await fetch(base+'/')).status,200);
  const r=await fetch(base+CATALOGO);assert.equal(r.status,200);const dto=await r.json();assert.equal(dto.produtos[0].preco,12);assert.doesNotMatch(JSON.stringify(dto),/sentinela|email|interno/);
  const count=leituras;
  for(const contrato of require('../src/validators/contratos')){
   const path=contrato.caminho.replace(/:lojaId/g,'loja-demo').replace(/:[A-Za-z]+/g,'p06');if(path==='/' || path===CATALOGO)continue;
   assert.equal((await fetch(base+path,{method:contrato.metodo})).status,404,contrato.metodo+path);
  }
  assert.equal((await fetch(base+'/publico/lojas/outra-demo/catalogo')).status,404);assert.equal(leituras,count);
  const depois=await Promise.all(Object.keys(dados).map(async p=>(await db.doc(p).get()).data()));assert.deepEqual(depois,antes);
  assert.equal((await db.collection('lojas').doc('loja-demo').collection('pedidos').get()).size,0);
  console.log('Ordem06 Emulator: health, catálogo projetado, 41 contratos bloqueados, outra loja, zero mutações pelo app e fixtures intactas aprovados.');
 }finally{await new Promise(resolve=>server.close(resolve));await db.terminate();}
}
main().catch(()=>{console.error('Teste de demonstração no Emulator falhou.');process.exitCode=1;});
