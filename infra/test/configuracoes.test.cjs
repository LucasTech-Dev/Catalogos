const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {calcular}=require('../scripts/custos.cjs');
test('scan detecta token sintético sem imprimir valor e limpa fixture',()=>{
  const {spawnSync}=require('node:child_process');const file='infra/.etapa25-scan-fixture';const segredo='gh'+'p_'+'x'.repeat(30);
  try{fs.writeFileSync(file,segredo);const r=spawnSync(process.execPath,['infra/scripts/verificar-segredos.cjs'],{encoding:'utf8'});assert.equal(r.status,1);assert.ok(r.stderr.includes(file));assert.ok(!r.stderr.includes(segredo));}
  finally{fs.rmSync(file,{force:true});}
});
test('custo aplica franquia uma vez por projeto/dia, não por restaurante',()=>{
  const a=calcular(1),b=calcular(10);assert.equal(a.firestoreReadsUsd,0);assert.ok(b.firestoreReadsUsd>0);assert.equal(b.readsMes,a.readsMes*10);assert.ok(calcular(150,{leiturasCatalogo:1006}).subtotalParcialUsd>calcular(150).subtotalParcialUsd);assert.throws(()=>calcular(0));
});
test('hosting SPA, cache do documento e assets, isolamento do contexto Docker',()=>{
  const hosting=JSON.parse(fs.readFileSync('infra/hosting/firebase.preparacao.json')).hosting;assert.deepEqual(hosting.rewrites,[{source:'**',destination:'/index.html'}]);assert.equal(hosting.public,'../../demo/dist');assert.ok(hosting.headers.some(h=>h.source==='/index.html' && h.headers.some(v=>v.value==='no-cache')));
  const dockerignore=fs.readFileSync('backend/.dockerignore','utf8');assert.ok(dockerignore.startsWith('**\n'));assert.ok(!dockerignore.includes('!\.env'));assert.ok(!dockerignore.includes('!test'));
  const indexes=JSON.parse(fs.readFileSync('firebase/firestore.indexes.json'));assert.equal(indexes.indexes.length,7);assert.ok(indexes.indexes.every(i=>i.queryScope==='COLLECTION'));assert.deepEqual(indexes.fieldOverrides,[]);
  const rules=fs.readFileSync('firebase/firestore.rules','utf8');assert.match(rules,/allow read, write: if false/);
});
test('Render: exemplo usa modo restrito, projeto dedicado, sem segredo nem porta fixa',()=>{
 const text=fs.readFileSync('infra/render/homologacao.backend.env.example','utf8');
 const env=Object.fromEntries(text.split('\n').filter(l=>l && !l.startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)];}));
 assert.equal(require('../../backend/src/config/ambiente').validarAmbiente(env).credentialMode,'render-secret-file');
 assert.equal(env.GCLOUD_PROJECT,'catalogos-homolog-2026');assert.equal(env.PORT,undefined);assert.equal(env.GOOGLE_APPLICATION_CREDENTIALS,undefined);
 const {spawnSync}=require('node:child_process');
 for(const name of ['backend/firebase-homologacao.json','backend/secrets/qualquer.json','backend/application_default_credentials.json'])assert.equal(spawnSync('git',['check-ignore','-q',name]).status,0,name);
});
test('Render existente: exemplo exige autorização explícita sem credencial ou Emulator',()=>{
 const text=fs.readFileSync('infra/render/bancorestaurante.backend.env.example','utf8');
 const env=Object.fromEntries(text.split('\n').filter(l=>l && !l.startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)];}));
 const validar=require('../../backend/src/config/ambiente').validarAmbiente;
 assert.equal(validar(env).projectId,'bancorestaurante');
 assert.equal(validar(env).credentialMode,'render-secret-file');
 assert.throws(()=>validar({...env,FIREBASE_EXISTING_DEMO_PROJECT_ID:''}));
 assert.equal(env.PORT,undefined);assert.equal(env.GOOGLE_APPLICATION_CREDENTIALS,undefined);assert.equal(env.FIRESTORE_EMULATOR_HOST,undefined);
 assert.doesNotMatch(text,/"private_key"\s*:/);
});
test('primeira publicação Render exige demo explícita e catálogo não aprovado',()=>{
 const texto=fs.readFileSync('infra/render/bancorestaurante.backend.env.example','utf8');
 const env=Object.fromEntries(texto.split('\n').filter(l=>l && !l.startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)];}));
 const {validarAmbiente}=require('../../backend/src/config/ambiente');assert.equal(validarAmbiente(env).demo.aprovado,false);assert.equal(validarAmbiente(env).demo.lojaId,'loja-demo');
 assert.throws(()=>validarAmbiente({...env,CATALOGOS_RUNTIME_MODE:''}));
 const app=fs.readFileSync('backend/src/app.js','utf8');assert.ok(app.indexOf('if (ambienteRuntime.demo)')<app.indexOf('require("./routes/'));
});
test('proposta IAM da demo não pede escrita, listagem ou administração/Auth',()=>{
 const role=JSON.parse(fs.readFileSync('infra/render/iam-demo-readonly.proposta.json','utf8'));
 assert.deepEqual(role.includedPermissions,['datastore.entities.get']);
 const codigo=fs.readFileSync('backend/src/demo/app.js','utf8');assert.ok(!codigo.includes('getAuth'));assert.ok(codigo.includes('.doc(path).get()'));
});
test('Render fixtures inicia sem projeto Firebase, secret ou credencial e inclui somente fixture pública no Docker',()=>{
 const text=fs.readFileSync('infra/render/fixtures.backend.env.example','utf8');
 const env=Object.fromEntries(text.split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)];}));
 const a=require('../../backend/src/config/ambiente').validarAmbiente(env);assert.equal(a.demo.fonte,'fixtures');assert.equal(a.projectId,undefined);assert.equal(a.credentialMode,undefined);assert.equal(env.PORT,undefined);
 assert.ok(!Object.keys(env).some(k=>k.startsWith('FIREBASE_') || k.startsWith('FIRESTORE_') || k.startsWith('GOOGLE_')));
 const ignore=fs.readFileSync('backend/.dockerignore','utf8');assert.ok(ignore.includes('!fixtures/catalogo-publico.json'));assert.ok(!ignore.includes('!fixtures/**'));assert.ok(!ignore.includes('!fixtures/homologacao.json'));
});
