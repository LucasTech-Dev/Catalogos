const test = require('node:test');
const assert = require('node:assert/strict');
const { validarAmbiente } = require('../../../backend/src/config/ambiente');
const { SECRET_PATH, carregarCredencial, inicializarFirebase } = require('../../../backend/src/config/credencialHomologacao');
const env = { APP_ENV:'homologacao', NODE_ENV:'production', GCLOUD_PROJECT:'catalogos-homolog-2026',
  FIREBASE_EXPECTED_PROJECT_ID:'catalogos-homolog-2026', FIREBASE_HOMOLOG_PROJECT_ID:'catalogos-homolog-2026',
  FIREBASE_CREDENTIAL_MODE:'render-secret-file', FIREBASE_SERVICE_ACCOUNT_EMAIL:'catalogos-api-homolog@catalogos-homolog-2026.iam.gserviceaccount.com',
  CORS_ORIGINS:'https://catalogo-demo-cz1.pages.dev', RATE_LIMIT_MODE:'enforce', HTTP_LOG_ENABLED:'1' };
const key = { type:'service_account', project_id:env.GCLOUD_PROJECT, client_email:env.FIREBASE_SERVICE_ACCOUNT_EMAIL,
  private_key:'sentinela-ficticia-sem-chave', private_key_id:'identificador-ficticio' };
function arquivo(value=key, overrides={}) {
  const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));let offset=0;
  return { openSync(path,flags){assert.equal(path,SECRET_PATH);assert.ok(flags & require('node:fs').constants.O_NOFOLLOW);return 7;},
    fstatSync(){return {isFile:()=>true,size:bytes.length};},
    readSync(fd,b,start,len){const n=Math.min(len,bytes.length-offset);bytes.copy(b,start,offset,offset+n);offset+=n;return n;},
    closeSync(){}, ...overrides };
}
const ambiente=()=>validarAmbiente(env);
test('homologação Render válida exige projeto permitido e identidade própria',()=>{
 assert.equal(ambiente().credentialMode,'render-secret-file');
 for(const patch of [{GCLOUD_PROJECT:''},{FIREBASE_EXPECTED_PROJECT_ID:'outro'},{FIREBASE_HOMOLOG_PROJECT_ID:''},
  {GCLOUD_PROJECT:'bancorestaurante',FIREBASE_EXPECTED_PROJECT_ID:'bancorestaurante',FIREBASE_HOMOLOG_PROJECT_ID:'bancorestaurante'},
  {FIREBASE_CREDENTIAL_MODE:''},{FIREBASE_CREDENTIAL_MODE:'desconhecido'},{FIREBASE_SERVICE_ACCOUNT_EMAIL:''},
  {FIREBASE_SERVICE_ACCOUNT_EMAIL:'conta@outro.iam.gserviceaccount.com'},{FIREBASE_SERVICE_ACCOUNT_EMAIL:'pessoal@example.com'},
  {GOOGLE_APPLICATION_CREDENTIALS:'/tmp/credencial.json'}, {FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'},
  {APP_ENV:'production'},{APP_ENV:'development'}, {RATE_LIMIT_MODE:'off'}, {HTTP_LOG_ENABLED:'0'}, {CORS_ORIGINS:'*'}])assert.throws(()=>validarAmbiente({...env,...patch}));
});
test('loader usa somente secret fixo e entrega campos mínimos ao cert',()=>{
 let recebido;const result=carregarCredencial(ambiente(),v=>{recebido=v;return 'credencial-mock';},arquivo({...key,token_uri:'https://host-indevido.example'}));
 assert.equal(result,'credencial-mock');assert.deepEqual(recebido,{projectId:key.project_id,clientEmail:key.client_email,privateKey:key.private_key});
});
test('falhas de arquivo, JSON, chave, tipo, projeto e conta falham sem vazar conteúdo',()=>{
 const erro=()=>{throw new Error('sentinela-ficticia-sem-chave');};
 const casos=[arquivo(key,{openSync:erro}),arquivo(key,{fstatSync:()=>({isFile:()=>false,size:1})}),
 arquivo(key,{fstatSync:()=>({isFile:()=>true,size:65537})}),arquivo('JSON sentinela-ficticia-sem-chave'),arquivo(null),
 ...[{type:'authorized_user'},{project_id:'bancorestaurante'},{client_email:'outra@catalogos-homolog-2026.iam.gserviceaccount.com'},
 {private_key:''},{private_key_id:''}].map(p=>arquivo({...key,...p})),arquivo(key,{readSync:erro})];
 for(const fs of casos)assert.throws(()=>carregarCredencial(ambiente(),()=>({}),fs),e=>!String(e).includes('sentinela') && !e.cause);
 assert.throws(()=>carregarCredencial(ambiente(),erro,arquivo()),e=>!String(e).includes('sentinela'));
 // SDK real rejeita material fictício, sem gerar chave ou obter token.
 assert.throws(()=>carregarCredencial(ambiente(),require('firebase-admin/app').cert,arquivo()),e=>!String(e).includes('sentinela'));
});
test('inicialização não usa ADC em Render e não aceita app prévio ou projeto divergente',()=>{
 const sdk={getApps:()=>[],cert:()=>({mock:true}),applicationDefault(){throw new Error('ADC indevido');},initializeApp:v=>v};
 assert.equal(inicializarFirebase(ambiente(),sdk,arquivo()).projectId,env.GCLOUD_PROJECT);
 assert.throws(()=>inicializarFirebase(ambiente(),{...sdk,getApps:()=>[{options:{projectId:env.GCLOUD_PROJECT}}]},arquivo()));
 assert.throws(()=>inicializarFirebase({projectId:'outro'}, {...sdk,getApps:()=>[{options:{projectId:env.GCLOUD_PROJECT}}]}));
 assert.throws(()=>inicializarFirebase(ambiente(),{...sdk,initializeApp(){throw new Error('segredo-sentinela');}},arquivo()),e=>!String(e).includes('sentinela'));
});
test('Emulator e identidade gerenciada preservados sem leitura de secret',()=>{
 const em=validarAmbiente({APP_ENV:'test',GCLOUD_PROJECT:'demo-teste',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'});
 const sdk={getApps:()=>[],initializeApp:v=>v,applicationDefault:()=>({managed:true}),cert(){throw new Error('cert indevido');}};
 assert.deepEqual(inicializarFirebase(em,sdk),{projectId:'demo-teste'});
 assert.equal(inicializarFirebase({projectId:'projeto-gerenciado',emulador:false},sdk).credential.managed,true);
});

test('GOOGLE_APPLICATION_CREDENTIALS aceita só o Secret File fixo e preserva cert sem fallback ADC',()=>{
 const configurado={...env,GOOGLE_APPLICATION_CREDENTIALS:SECRET_PATH};
 const validado=validarAmbiente(configurado);
 let chamadaCert=0;
 const sdk={getApps:()=>[],cert:()=>{chamadaCert++;return {secret:true};},
  applicationDefault(){throw new Error('ADC não autorizada');},initializeApp:v=>v};
 assert.equal(inicializarFirebase(validado,sdk,arquivo()).credential.secret,true);
 assert.equal(chamadaCert,1);
 for(const path of ['/tmp/credencial.json',SECRET_PATH+' ', '/etc/secrets/../secrets/firebase-homologacao.json'])
  assert.throws(()=>validarAmbiente({...configurado,GOOGLE_APPLICATION_CREDENTIALS:path}));
 assert.throws(()=>validarAmbiente({...configurado,FIREBASE_CREDENTIAL_MODE:'managed'}));
 assert.throws(()=>inicializarFirebase(validado,sdk,arquivo(key,{openSync(){throw new Error('sentinela-privada');}})),
  e=>!String(e).includes('sentinela') && !e.cause);
});
test('produção comercial recusa reutilização da configuração de homologação',()=>{
 assert.throws(()=>validarAmbiente({...env,APP_ENV:'production',FIREBASE_CREDENTIAL_MODE:'managed'}));
});
test('fixtures correspondem aos schemas, referências e UIDs, sem duplicações/pedidos/segredos',()=>{
 const {planejar}=require('../scripts/homologacao-dry-run');
 for(const id of ['',undefined,'bancorestaurante','producao','demo-teste'])assert.throws(()=>planejar(id));
 const plano=planejar(env.GCLOUD_PROJECT),docs=plano.documents;
 assert.equal(plano.modo,'simulacao-sem-escrita');assert.equal(new Set(docs.map(d=>d.path)).size,docs.length);
 const v=require('../../../backend/src/validators/administracao'),perfil=require('../../../backend/src/validators/perfil');
 for(const {path,data} of docs){
  assert.ok(!path.includes('/pedidos/'));
  assert.doesNotMatch(JSON.stringify(data),/password|senha|private_key|whatsapp/);
  if(/^lojas\/[^/]+$/.test(path)){const {ativo,...dados}=data;assert.equal(ativo,true);v.loja(dados);}
  if(path.includes('/categorias/'))v.categoria(data);
  if(path.includes('/produtos/')){v.produto(data);assert.ok(docs.some(d=>d.path===path.split('/produtos/')[0]+'/categorias/'+data.categoriaId));}
  if(path.includes('/enderecos/'))perfil.endereco(data);
  if(path.startsWith('usuarios/'))assert.ok(['cliente','admin'].includes(data.role) && docs.some(d=>d.path==='lojas/'+data.lojaId));
 }
 assert.deepEqual(planejar(env.GCLOUD_PROJECT),plano);
});
test('server falha antes do listen e não imprime ambiente ou erro de inicialização',()=>{
 const {spawnSync}=require('node:child_process');
 const r=spawnSync(process.execPath,[require('node:path').join(__dirname,'../../../backend/src/server.js')],{
  encoding:'utf8',env:{PATH:process.env.PATH,...env,GCLOUD_PROJECT:'bancorestaurante',FIREBASE_EXPECTED_PROJECT_ID:'bancorestaurante',SENTINELA:'valor-privado-sentinela'}});
 assert.equal(r.status,1);assert.equal(r.stdout,'');assert.deepEqual(JSON.parse(r.stderr),{evento:'inicializacao',status:500,codigo:'configuracao_invalida'});
 assert.doesNotMatch(r.stderr,/sentinela|bancorestaurante|stack|private/);
});

test('bancorestaurante exige opt-in exato, homologação, projeto/conta corretos e Secret File',()=>{
 const demo={...env,GCLOUD_PROJECT:'bancorestaurante',FIREBASE_EXPECTED_PROJECT_ID:'bancorestaurante',FIREBASE_HOMOLOG_PROJECT_ID:'bancorestaurante',FIREBASE_EXISTING_DEMO_PROJECT_ID:'bancorestaurante',FIREBASE_SERVICE_ACCOUNT_EMAIL:'catalogos-api-demo@bancorestaurante.iam.gserviceaccount.com'};
 const ambienteDemo=validarAmbiente(demo);
 assert.equal(ambienteDemo.projectId,'bancorestaurante');
 assert.equal(ambienteDemo.credentialMode,'render-secret-file');
 for(const patch of [{FIREBASE_EXISTING_DEMO_PROJECT_ID:''},{FIREBASE_EXISTING_DEMO_PROJECT_ID:'outro'},
 {FIREBASE_CREDENTIAL_MODE:'managed'},{FIREBASE_CREDENTIAL_MODE:''},{APP_ENV:'production'},{APP_ENV:'development'},
 {GCLOUD_PROJECT:''},{GCLOUD_PROJECT:'outro'},{FIREBASE_EXPECTED_PROJECT_ID:'outro'},{FIREBASE_HOMOLOG_PROJECT_ID:'outro'},
 {FIREBASE_SERVICE_ACCOUNT_EMAIL:env.FIREBASE_SERVICE_ACCOUNT_EMAIL},{GOOGLE_APPLICATION_CREDENTIALS:'/tmp/privado.json'},
 {FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'},{CORS_ORIGINS:'*'},{RATE_LIMIT_MODE:'off'}])assert.throws(()=>validarAmbiente({...demo,...patch}));
 assert.throws(()=>validarAmbiente({...env,FIREBASE_EXISTING_DEMO_PROJECT_ID:'bancorestaurante'}));
 assert.throws(()=>validarAmbiente({...demo,APP_ENV:'production',FIREBASE_CREDENTIAL_MODE:'managed',FIREBASE_EXISTING_DEMO_PROJECT_ID:'',FIREBASE_HOMOLOG_PROJECT_ID:'',FIREBASE_SERVICE_ACCOUNT_EMAIL:''}));
 // Somente IO/SDK simulados; nenhum arquivo ou dado do projeto existente é lido.
 const credencial={...key,project_id:'bancorestaurante',client_email:demo.FIREBASE_SERVICE_ACCOUNT_EMAIL};
 let config;
 const sdk={getApps:()=>[],cert:k=>({mock:k.projectId}),applicationDefault(){throw new Error('ADC pessoal indevido');},initializeApp:k=>{config=k;return k;}};
 inicializarFirebase(ambienteDemo,sdk,arquivo(credencial));
 assert.equal(config.projectId,'bancorestaurante');assert.equal(config.credential.mock,'bancorestaurante');
 for(const dados of [key,{...credencial,client_email:'outra@bancorestaurante.iam.gserviceaccount.com'}])assert.throws(()=>carregarCredencial(ambienteDemo,sdk.cert,arquivo(dados)));
 assert.throws(()=>carregarCredencial(ambienteDemo,sdk.cert,arquivo(credencial,{openSync(){throw new Error('segredo-sentinela');}})),e=>!String(e).includes('sentinela'));
});
