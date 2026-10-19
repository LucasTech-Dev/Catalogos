const test=require('node:test'),assert=require('node:assert/strict');
const {Readable,Writable}=require('node:stream'),http=require('node:http');
const {validarAmbiente}=require('../../../backend/src/config/ambiente');
const {criarAppDemo,CATALOGO}=require('../../../backend/src/demo/app');
const {catalogoDemo}=require('../../../backend/src/demo/catalogo');
const env={APP_ENV:'homologacao',NODE_ENV:'production',GCLOUD_PROJECT:'bancorestaurante',FIREBASE_EXPECTED_PROJECT_ID:'bancorestaurante',FIREBASE_HOMOLOG_PROJECT_ID:'bancorestaurante',FIREBASE_EXISTING_DEMO_PROJECT_ID:'bancorestaurante',FIREBASE_CREDENTIAL_MODE:'render-secret-file',FIREBASE_SERVICE_ACCOUNT_EMAIL:'catalogos-api-demo@bancorestaurante.iam.gserviceaccount.com',CORS_ORIGINS:'https://catalogo-demo-cz1.pages.dev',RATE_LIMIT_MODE:'enforce',HTTP_LOG_ENABLED:'1',CATALOGOS_RUNTIME_MODE:'public-readonly-demo',CATALOGOS_DEMO_LOJA_ID:'loja-demo',CATALOGOS_DEMO_CATALOG_APPROVED:'1',CATALOGOS_DEMO_PRODUCT_IDS:'["p"]',CATALOGOS_DEMO_CATEGORY_IDS:'["c"]'};
function request(app,path='/',method='GET',headers={}) {
 return new Promise((resolve,reject)=>{
  const req=new Readable({read(){this.push(null);}});req.method=method;req.url=path;req.headers=Object.fromEntries(Object.entries(headers).map(([k,v])=>[k.toLowerCase(),v]));
  const res=new http.ServerResponse(req),chunks=[];res.assignSocket(new Writable({write(chunk,enc,cb){chunks.push(Buffer.from(chunk));cb();}}));
  res.on('error',reject);res.on('finish',()=>{const raw=Buffer.concat(chunks).toString().split('\r\n\r\n')[1];resolve({status:res.statusCode,body:raw?JSON.parse(raw):null,headers:res.getHeaders()});});app.handle(req,res);
 });
}
function fixture(patch={}) {
 const docs={'lojas/loja-demo':{nome:'Loja pública',ativo:true,email:'sentinela-privada',endereco:{rua:'sentinela-privada'}},'lojas/loja-demo/categorias/c':{nome:'Categoria',ativo:true,segredo:'sentinela-privada'},'lojas/loja-demo/produtos/p':{nome:'Produto',descricao:'Descrição',preco:12,categoriaId:'c',ativo:true,disponivel:true,imagem:'https://imagens.example/p.png',cliente:'sentinela-privada',...patch}};
 const estado={reads:[],writes:0};
 const db={doc(path){assert.ok(Object.hasOwn(docs,path),'acesso indevido '+path);return {get:async()=>{estado.reads.push(path);return {exists:true,data:()=>docs[path]};},set(){estado.writes++;throw new Error('escrita');},update(){estado.writes++;throw new Error('escrita');},delete(){estado.writes++;throw new Error('escrita');}};},collection(){throw new Error('Varredura indevida');}};
 return {db,estado,docs};
}
const conf=()=>validarAmbiente(env).demo;
test('configuração demo falha fechada, sem afetar modo normal/Emulator',()=>{
 assert.equal(conf().lojaId,'loja-demo');
 for(const patch of [{CATALOGOS_RUNTIME_MODE:'typo'},{APP_ENV:'development'},{APP_ENV:'production'},{CATALOGOS_DEMO_LOJA_ID:''},{CATALOGOS_DEMO_LOJA_ID:'outra'}, {GCLOUD_PROJECT:'outro'},{FIREBASE_EXPECTED_PROJECT_ID:'outro'},{FIREBASE_CREDENTIAL_MODE:'managed'},{FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'},{CATALOGOS_DEMO_CATALOG_APPROVED:''},{CATALOGOS_DEMO_PRODUCT_IDS:''},{CATALOGOS_DEMO_PRODUCT_IDS:'[]'},{CATALOGOS_DEMO_CATEGORY_IDS:'["../c"]'},{CATALOGOS_DEMO_PRODUCT_IDS:'["p","p"]'},{CATALOGOS_DEMO_PRODUCT_IDS:JSON.stringify(Array.from({length:51},(_,i)=>'p'+i))}])assert.throws(()=>validarAmbiente({...env,...patch}));
 assert.equal(validarAmbiente({}).demo,undefined);
 assert.equal(validarAmbiente({APP_ENV:'test',GCLOUD_PROJECT:'demo-teste',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'}).emulador,true);
});
test('health/HEAD/CORS e catálogo aprovado com projeções mínimas e cache',async()=>{
 const {db,estado}=fixture(),app=criarAppDemo(conf(),()=>db,env);
 assert.equal((await request(app)).status,200);assert.equal(estado.reads.length,0);
 assert.equal((await request(app,'/','HEAD')).status,200);
 const r=await request(app,CATALOGO,'GET',{Origin:env.CORS_ORIGINS});assert.equal(r.status,200);assert.equal(r.headers['access-control-allow-origin'],env.CORS_ORIGINS);
 assert.deepEqual(Object.keys(r.body.loja),['id','nome']);assert.deepEqual(r.body.categorias,[{id:'c',nome:'Categoria'}]);
 assert.deepEqual(Object.keys(r.body.produtos[0]),['id','nome','descricao','preco','categoriaId','disponivel','imagem']);assert.doesNotMatch(JSON.stringify(r.body),/sentinela|email|endereco|criadoEm/);
 await request(app,CATALOGO);assert.equal(estado.reads.length,3);assert.equal(estado.writes,0);
 assert.equal((await request(app,CATALOGO,'GET',{Origin:'https://negada.example'})).status,403);
 assert.equal((await request(app,CATALOGO,'OPTIONS',{Origin:env.CORS_ORIGINS,'Access-Control-Request-Method':'GET'})).status,204);
 assert.equal((await request(app,CATALOGO,'OPTIONS',{Origin:env.CORS_ORIGINS,'Access-Control-Request-Method':'POST'})).status,404);
});
test('sem revisão humana: catálogo 503 sem consulta; saúde continua',async()=>{
 const config=validarAmbiente({...env,CATALOGOS_DEMO_CATALOG_APPROVED:'0',CATALOGOS_DEMO_PRODUCT_IDS:'[]',CATALOGOS_DEMO_CATEGORY_IDS:'[]'}).demo;
 const app=criarAppDemo(config,()=>{throw new Error('consulta indevida');},env);
 assert.equal((await request(app)).status,200);assert.equal((await request(app,CATALOGO)).status,503);
});
test('todos contratos privados/escritas, aliases e métodos bloqueados antes do banco',async()=>{
 const {db,estado}=fixture(),app=criarAppDemo(conf(),()=>db,{...env,RATE_LIMIT_MODE:'off'});
 const contratos=require('../../../backend/src/validators/contratos');
 for(const r of contratos){const path=r.caminho.replace(/:lojaId/g,'loja-demo').replace(/:[A-Za-z]+/g,'p');if(path==='/' || path===CATALOGO)continue;
  const resposta=await request(app,path,r.metodo,{authorization:'Bearer token-irrelevante'});assert.equal(resposta.status,404,r.metodo+path);
 }
 for(const path of ['/publico/lojas/outra/catalogo',CATALOGO+'/',CATALOGO+'?lojaId=outra','/publico/lojas/%6coja-demo/catalogo','/publico/lojas/loja-demo%2f..%2foutra/catalogo','//publico/lojas/loja-demo/catalogo',CATALOGO.toUpperCase(),'/lojas/loja-demo/produtos'])assert.equal((await request(app,path)).status,404,path);
 for(const method of ['POST','PUT','PATCH','DELETE','TRACE','CONNECT'])assert.equal((await request(app,CATALOGO,method)).status,404,method);
 assert.equal(estado.reads.length,0);assert.equal(estado.writes,0);
});
test('dados inativos/órfãos, imagens com query e resposta grande não são publicados',async()=>{
 const {docs}=fixture({imagem:'https://imagens.example/p?token=privado'});
 const ler=async p=>docs[p];assert.equal((await catalogoDemo(conf(),ler)).produtos[0].imagem,undefined);
 docs['lojas/loja-demo/categorias/c'].ativo=false;assert.deepEqual((await catalogoDemo(conf(),ler)).produtos,[]);
 docs['lojas/loja-demo'].ativo=undefined;await assert.rejects(()=>catalogoDemo(conf(),ler));
 const config={...conf(),produtos:Array.from({length:50},(_,i)=>'p'+i)};
 await assert.rejects(()=>catalogoDemo(config,async p=>p==='lojas/loja-demo'?{nome:'Loja',ativo:true}:p.endsWith('/c')?{nome:'Categoria',ativo:true}:{nome:'x'.repeat(200),descricao:'x'.repeat(2000),preco:1,categoriaId:'c',ativo:true}),e=>e.status===503);
});
test('limiter local 429/Retry-After e erros seguros',async()=>{
 const {db}=fixture(),app=criarAppDemo(conf(),()=>db,env);
 for(let i=0;i<60;i++)assert.equal((await request(app,CATALOGO)).status,200);
 const r=await request(app,CATALOGO,'GET',{'X-Forwarded-For':'forjado'});assert.equal(r.status,429);assert.ok(r.headers['retry-after']);
 const erroApp=criarAppDemo(conf(),()=>{throw new Error('senha-sentinela');},env),log=console.error;console.error=()=>{};
 try{const e=await request(erroApp,CATALOGO);assert.equal(e.status,500);assert.doesNotMatch(JSON.stringify(e.body),/senha|sentinela|stack/);}finally{console.error=log;}
});
test('app real no modo demo não carrega Auth, routers/controllers/services privados',()=>{
 const {spawnSync}=require('node:child_process'),path=require('node:path');
 const script=`const Module=require('node:module'),original=Module._load;require.cache[require.resolve('./src/config/firebase')]={exports:{}};Module._load=function(id,...args){if(id.includes('/routes/') || id.includes('/controllers/') || id.includes('/services/') || id==='firebase-admin/auth')throw new Error('Carregamento privado');return original.call(this,id,...args)};const app=require('./src/app');if(!app || !app.handle)process.exit(1);`;
 const r=spawnSync(process.execPath,['-e',script],{cwd:path.join(__dirname,'../../../backend'),env:{PATH:process.env.PATH,...env},encoding:'utf8'});assert.equal(r.status,0,r.stderr);
});
