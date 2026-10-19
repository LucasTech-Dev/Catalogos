const test=require('node:test'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const {verificarConexaoFirebase}=require('../../../backend/src/config/conexaoFirebase');
const root=path.resolve(__dirname,'../../..');
const env=Object.fromEntries(fs.readFileSync(path.join(root,'infra/render/bancorestaurante.full.backend.env.example'),'utf8').split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1)];}));
test('bootstrap consulta apenas documento fixo e não acessa seus campos',async()=>{
 let leituras=0;
 await verificarConexaoFirebase({doc(p){assert.equal(p,'lojas/loja-demo');return {get:async()=>{leituras++;return {exists:true,data(){throw new Error('Campos privados não devem ser lidos');}};}};}});
 assert.equal(leituras,1);
});
test('documento ausente, falha e timeout produzem somente erro sanitizado',async()=>{
 for(const get of [async()=>({exists:false}),async()=>{throw new Error('sentinela-privada');},()=>new Promise(()=>{})])
  await assert.rejects(verificarConexaoFirebase({doc:()=>({get})},5),e=>e.message==='Conexão Firebase indisponível.'&&!e.cause);
});
test('server espera conexão antes do listen; falha não abre HTTP nem vaza mensagem',()=>{
 for(const sucesso of [true,false]){
  const script=`const M=require('node:module'),assert=require('node:assert/strict');const load=M._load;let finalizou=false,leituras=0;M._load=function(id,parent,...rest){if(parent?.filename===${JSON.stringify(path.join(root,'backend/src/server.js'))}){if(id==='./app')return {listen(port,host,cb){assert.equal(finalizou,true);assert.equal(leituras,1);assert.equal(host,'0.0.0.0');console.log('LISTEN_SIMULADO');return {close(){}};}};if(id==='firebase-admin/firestore')return {getFirestore:()=>({doc(p){assert.equal(p,'lojas/loja-demo');return {get:async()=>{leituras++;finalizou=true;if(!${sucesso})throw new Error('sentinela-privada');return {exists:true};}};}})};}return load.call(this,id,parent,...rest);};require(${JSON.stringify(path.join(root,'backend/src/server.js'))});`;
  const r=spawnSync(process.execPath,['-e',script],{env:{PATH:process.env.PATH,...env},encoding:'utf8',timeout:5000});
  assert.ifError(r.error);assert.equal(r.status,sucesso?0:1);
  assert.doesNotMatch(r.stdout+r.stderr,/sentinela|stack|private_key/);
  if(sucesso){assert.match(r.stdout,/firebase_conexao/);assert.match(r.stdout,/LISTEN_SIMULADO/);assert.equal(r.stderr,'');}
  else{assert.equal(r.stdout,'');assert.deepEqual(JSON.parse(r.stderr),{evento:'inicializacao',status:503,codigo:'firebase_indisponivel'});}
 }
});
test('checagem remota exige configuração full de homologação autorizada',()=>{
 const validar=require('../../../backend/src/config/ambiente').validarAmbiente;
 assert.equal(validar(env).verificarFirebase,true);
 for(const patch of [{FIREBASE_STARTUP_CHECK:'0'},{FIREBASE_STARTUP_CHECK:'sim'},{CATALOGOS_RUNTIME_MODE:''},{APP_ENV:'test'},{FIREBASE_CREDENTIAL_MODE:'managed'}])assert.throws(()=>validar({...env,...patch}));
});
test('falha síncrona ao obter SDK também é sanitizada antes do listen',()=>{
 const script=`const M=require('node:module'),load=M._load;M._load=function(id,parent,...rest){if(parent?.filename===${JSON.stringify(path.join(root,'backend/src/server.js'))}){if(id==='./app')return {listen(){throw new Error('listen indevido');}};if(id==='firebase-admin/firestore')return {getFirestore(){throw new Error('sentinela-privada');}};}return load.call(this,id,parent,...rest);};require(${JSON.stringify(path.join(root,'backend/src/server.js'))});`;
 const r=spawnSync(process.execPath,['-e',script],{env:{PATH:process.env.PATH,...env},encoding:'utf8',timeout:5000});
 assert.ifError(r.error);assert.equal(r.status,1);assert.equal(r.stdout,'');
 assert.deepEqual(JSON.parse(r.stderr),{evento:'inicializacao',status:503,codigo:'firebase_indisponivel'});
});
