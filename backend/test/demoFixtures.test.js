const test=require('node:test'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process'),path=require('node:path');
const {validarAmbiente}=require('../src/config/ambiente');
const env={APP_ENV:'homologacao',NODE_ENV:'production',CATALOGOS_RUNTIME_MODE:'public-fixture-demo',CATALOGOS_DEMO_LOJA_ID:'loja-demo',CORS_ORIGINS:'https://catalogo-demo-cz1.pages.dev',RATE_LIMIT_MODE:'enforce',HTTP_LOG_ENABLED:'1'};
test('fixtures são explícitas, sem credenciais, outro projeto, Emulator ou listas de publicação',()=>{
 assert.deepEqual(validarAmbiente(env),{demo:{fonte:'fixtures',lojaId:'loja-demo'},emulador:false});
 for(const patch of [{CATALOGOS_RUNTIME_MODE:''},{CATALOGOS_DEMO_LOJA_ID:'outra'},{APP_ENV:'production'},{NODE_ENV:'development'},{CORS_ORIGINS:'*'},{CORS_ORIGINS:'http://localhost:5173'},{RATE_LIMIT_MODE:'off'},{HTTP_LOG_ENABLED:'0'},{FIREBASE_CREDENTIAL_MODE:'render-secret-file'},{FIREBASE_EXPECTED_PROJECT_ID:'bancorestaurante'},{FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'},{FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'},{GCLOUD_PROJECT:'bancorestaurante'},{GOOGLE_APPLICATION_CREDENTIALS:'/tmp/nao-ler.json'},{CATALOGOS_DEMO_PRODUCT_IDS:'[]'},{CATALOGOS_DEMO_CATALOG_APPROVED:'1'}])assert.throws(()=>validarAmbiente({...env,...patch}));
 assert.equal(validarAmbiente({...env,APP_ENV:'development',NODE_ENV:'development',CORS_ORIGINS:'http://127.0.0.1:5173'}).demo.fonte,'fixtures');
});
test('app real com fixtures não carrega SDK/rotas privadas e bloqueia escrita sem modificar fixture',()=>{
 const script=`
 const assert=require('node:assert/strict'),fs=require('node:fs'),Module=require('node:module');
 const original=Module._load;Module._load=function(id,...args){if(/firebase-admin|google-auth|gcloud|\\/routes\\/|\\/controllers\\/|\\/services\\//.test(id))throw Error('Importação proibida: '+id);return original.call(this,id,...args);};
 const antes=fs.readFileSync('fixtures/catalogo-publico.json','utf8');
 const app=require('./src/app'),server=app.listen(0,'127.0.0.1');
 server.once('listening',async()=>{try{
 const base='http://127.0.0.1:'+server.address().port,cat='/publico/lojas/loja-demo/catalogo';
 for(const method of ['GET','HEAD'])assert.equal((await fetch(base+'/',{method})).status,200);
 const r=await fetch(base+cat,{headers:{Origin:process.env.CORS_ORIGINS}});assert.equal(r.status,200);assert.equal(r.headers.get('access-control-allow-origin'),process.env.CORS_ORIGINS);
 const d=await r.json();assert.equal(d.loja.id,'loja-demo');assert.equal(d.categorias.length,3);assert.equal(d.produtos.length,6);assert.equal(d.produtos.find(p=>p.id==='prato-teste').preco,20);assert.equal(d.produtos.find(p=>p.id==='lanche-vegetariano').disponivel,false);assert.ok(Buffer.byteLength(JSON.stringify(d))<65536);assert.doesNotMatch(JSON.stringify(d),/usuarios|clientes|enderecos|email|private_key/);
 assert.equal((await fetch(base+cat,{method:'HEAD'})).status,200);
 assert.equal((await fetch(base+cat,{headers:{Origin:'https://negada.example'}})).status,403);
 assert.equal((await fetch(base+cat,{method:'OPTIONS',headers:{Origin:process.env.CORS_ORIGINS,'Access-Control-Request-Method':'GET'}})).status,204);
 for(const contrato of require('./src/validators/contratos')){const target=contrato.caminho.replace(/:lojaId/g,'loja-demo').replace(/:[A-Za-z]+/g,'p');if(target==='/' || target===cat)continue;assert.equal((await fetch(base+target,{method:contrato.metodo})).status,404,contrato.metodo+target);}
 for(const target of ['/admin','/login','/publico/lojas/outra/catalogo',cat+'/',cat+'?outra=loja',cat.toUpperCase()])assert.equal((await fetch(base+target)).status,404);
 for(const method of ['POST','PUT','PATCH','DELETE'])assert.equal((await fetch(base+cat,{method})).status,404);
 assert.equal(fs.readFileSync('fixtures/catalogo-publico.json','utf8'),antes);
 assert.ok(!Object.keys(require.cache).some(k=>k.includes('firebase-admin')));
 for(let i=0;i<60;i++)await fetch(base+cat);assert.equal((await fetch(base+cat)).status,429);
 }catch(e){console.error(e);process.exitCode=1;}finally{server.close();server.closeAllConnections();}});
 `;
 const r=spawnSync(process.execPath,['-e',script],{cwd:path.join(__dirname,'..'),env:{PATH:process.env.PATH,...env},encoding:'utf8',timeout:25000});assert.equal(r.status,0,r.stderr);
});
