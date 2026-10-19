const test=require('node:test'),assert=require('node:assert/strict');
const {validarAmbiente,portaServidor}=require('../../../backend/src/config/ambiente');
const {criarLimites,observar}=require('../../../backend/src/middleware/operacao');
const externo={APP_ENV:'production',NODE_ENV:'production',GCLOUD_PROJECT:'catalogos-prod-exemplo',FIREBASE_EXPECTED_PROJECT_ID:'catalogos-prod-exemplo',CORS_ORIGINS:'https://loja.example.com',RATE_LIMIT_MODE:'enforce',HTTP_LOG_ENABLED:'1'};
test('ambientes externos falham fechados antes de inicializar Firebase',()=>{
  assert.equal(validarAmbiente(externo).emulador,false);
  for(const patch of [{NODE_ENV:'test'},{GCLOUD_PROJECT:''},{FIREBASE_EXPECTED_PROJECT_ID:'outro'},{CORS_ORIGINS:'*'},{CORS_ORIGINS:'http://loja.example.com'},{CORS_ORIGINS:'https://loja.example.com/path'},{GOOGLE_APPLICATION_CREDENTIALS:'/segredo.json'},{FIREBASE_AUTH_EMULATOR_HOST:'localhost:9099'},{RATE_LIMIT_MODE:'off'},{HTTP_LOG_ENABLED:'0'}])assert.throws(()=>validarAmbiente({...externo,...patch}));
  assert.throws(()=>validarAmbiente({NODE_ENV:'production'}));assert.throws(()=>validarAmbiente({APP_ENV:'test'}));assert.throws(()=>validarAmbiente({APP_ENV:'typo'}));
  assert.equal(portaServidor('8080'),8080);for(const v of ['x','0','65536','1.1'])assert.throws(()=>portaServidor(v));
});
const req=(url='/lojas/a/pedidos',method='POST',peer='127.0.0.1')=>({originalUrl:url,method,socket:{remoteAddress:peer},headers:{'x-forwarded-for':'IP-forjado'}});
const res=()=>({headers:{},set(k,v){this.headers[k]=v;}});
test('limites reais 429, Retry-After, janela, identidade e tentativas não usam nonce',()=>{
  let now=0;const limites=criarLimites({enabled:true,clock:()=>now,ip:{checkout:2},uid:{checkout:1}}),r=res();let error;
  limites.entrada(req(),r,e=>{error=e;});assert.equal(error,undefined);
  limites.entrada(req(),r,e=>{error=e;});assert.equal(error,undefined);
  limites.entrada({...req(),headers:{'x-forwarded-for':'outro','idempotency-key':'nova'}},r,e=>{error=e;});assert.equal(error.status,429);assert.equal(r.headers['Retry-After'],'60');
  now=60000;limites.entrada(req(),r,e=>{error=e;});assert.equal(error,undefined);
  limites.identidade(req(),r,'A');assert.throws(()=>limites.identidade(req('/lojas/a/pedidos/'),r,'A'),e=>e.status===429);assert.doesNotThrow(()=>limites.identidade(req(),r,'B'));
});
test('limites têm memória limitada, health/OPTIONS livres e modo local preservado',()=>{
  const l=criarLimites({enabled:true,maxChaves:1});const r=res();let e;l.entrada(req('/','GET'),r,x=>{e=x;});assert.equal(e,undefined);l.entrada(req('/x','OPTIONS'),r,x=>{e=x;});assert.equal(e,undefined);
  l.entrada(req(),r,x=>{e=x;});l.entrada(req('/lojas/a/pedidos','POST','outro'),r,x=>{e=x;});assert.equal(e.status,429);
  const off=criarLimites();for(let i=0;i<1000;i++)off.entrada(req(),r,x=>assert.equal(x,undefined));
});
test('observabilidade nunca inclui URL, identidade, body, tokens ou PII',()=>{
  const before=process.env.HTTP_LOG_ENABLED,info=console.info;let line,finish;process.env.HTTP_LOG_ENABLED='1';console.info=v=>{line=v;};
  try{observar({...req('/lojas/segredo/pedidos?token=segredo'),body:{nome:'segredo'},requestId:'id'}, {statusCode:201,once(event,fn){finish=fn;}},()=>{});finish();assert.doesNotMatch(line,/segredo|127\.0|forjado/);assert.equal(JSON.parse(line).evento,'http_acesso');}
  finally{console.info=info;if(before===undefined)delete process.env.HTTP_LOG_ENABLED;else process.env.HTTP_LOG_ENABLED=before;}
});
