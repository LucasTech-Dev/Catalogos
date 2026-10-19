const test=require('node:test'),assert=require('node:assert/strict');
const {validarAmbiente}=require('../../../backend/src/config/ambiente');
test('emuladores não podem ser misturados com Firebase real',()=>{
  for(const env of [
    {FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'},
    {FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'},
    {GCLOUD_PROJECT:'bancorestaurante',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'},
    {GCLOUD_PROJECT:'demo-teste',FIREBASE_AUTH_EMULATOR_HOST:'outro-host:9099',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'},
    {GCLOUD_PROJECT:'demo-teste'},
    {GCLOUD_PROJECT:'demo-teste',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:99999',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'},
  ])assert.throws(()=>validarAmbiente(env));
  assert.deepEqual(validarAmbiente({GCLOUD_PROJECT:'demo-teste',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099',FIRESTORE_EMULATOR_HOST:'localhost:8080'}),{projectId:'demo-teste',emulador:true});
  assert.equal(validarAmbiente({GCLOUD_PROJECT:'projeto-real-explicito'}).emulador,false);
});
test('logger e respostas não incluem dados em mensagens internas',()=>{
  const {registrarFalha,responderErro,ErroDominio}=require('../../../backend/src/lib/seguranca');
  const original=console.error;let log='';console.error=v=>{log+=v;};
  try{registrarFalha('teste',Object.assign(new Error('senha=sentinela token=sentinela'),{code:'segredo-sentinela'}));assert.doesNotMatch(log,/sentinela/);}finally{console.error=original;}
  const res={status(v){this.codigo=v;return this;},json(v){this.body=v;return this;}};
  responderErro(res,new Error('sentinela-interna'));assert.equal(res.codigo,500);assert.doesNotMatch(JSON.stringify(res.body),/sentinela/);
  responderErro(res,new ErroDominio('Campo inválido.'));assert.equal(res.codigo,400);assert.equal(res.body.error,'Campo inválido.');
});
