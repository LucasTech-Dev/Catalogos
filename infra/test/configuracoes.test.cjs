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
