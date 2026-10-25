// Operação local delimitada: captura de catálogo e aplicação de seis listas previamente propostas.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {GoogleAuth}=require('../../backend/node_modules/google-auth-library');
const ROOT=path.resolve(__dirname,'../..'),DIR=path.join(ROOT,'private-backups/ingredientes-publicacao'),PREFIX='projects/bancorestaurante/databases/(default)/documents/',BASE='https://firestore.googleapis.com/v1/';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const canon=x=>JSON.stringify(sort(x));function sort(x){return Array.isArray(x)?x.map(sort):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])])):x;}
const decode=v=>'mapValue'in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)])):'arrayValue'in v?(v.arrayValue.values||[]).map(decode):'integerValue'in v?Number(v.integerValue):Object.values(v)[0];
const value=v=>v===null?{nullValue:null}:Array.isArray(v)?{arrayValue:{values:v.map(value)}}:typeof v==='string'?{stringValue:v}:typeof v==='boolean'?{booleanValue:v}:typeof v==='number'?(Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v}):{mapValue:{fields:fields(v)}};
const fields=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,value(v)]));
const save=(name,data,exclusive=false)=>fs.writeFileSync(path.join(DIR,name),JSON.stringify(data,null,2)+'\n',{mode:0o600,flag:exclusive?'wx':'w'});
const load=name=>JSON.parse(fs.readFileSync(path.join(DIR,name)));
async function main(){
 process.umask(0o077);fs.mkdirSync(DIR,{recursive:true,mode:0o700});
 const mode=process.argv[2];assert.ok(['capture','apply'].includes(mode));assert.ok(!process.env.FIRESTORE_EMULATOR_HOST,'Executor de produção não usa Emulator.');
 const proposal=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/ADAPTACAO_SERVERLESS/PROPOSTA_INGREDIENTES.json'))),updates=proposal.entries.filter(e=>e.fieldChanged.length);
 assert.equal(proposal.project,'bancorestaurante');assert.equal(proposal.store,'loja-demo');assert.equal(proposal.entries.length,11);assert.equal(updates.length,6);
 assert.deepEqual(updates.map(e=>e.id).sort(),['bacon-burger','bacon-supreme','batata-da-casa','batata-frita','chicken-crispy','onion-rings']);
 const {projetarRegistro}=await import('../../frontend/src/services/projecaoPublica.js');
 const client=await new GoogleAuth({scopes:[mode==='capture'?'https://www.googleapis.com/auth/cloud-platform.read-only':'https://www.googleapis.com/auth/datastore']}).getClient();
 const get=async p=>(await client.request({url:BASE+PREFIX+p,method:'GET',retry:false,timeout:20000})).data;
 if(mode==='capture'){
  const paths=['lojas/loja-demo','catalogosPublicos/loja-demo','lojas/loja-demo/controleCompra/versao'];
  for(const base of ['lojas','catalogosPublicos']){for(const id of ['hamburgueres','porcoes','bebidas','combos'])paths.push(`${base}/loja-demo/categorias/${id}`);for(const e of proposal.entries)paths.push(`${base}/loja-demo/produtos/${e.id}`);}
  const documents=[];for(const p of paths)documents.push({...await get(p),path:p});
  for(const e of proposal.entries){const d=decode({mapValue:{fields:documents.find(d=>d.path===`lojas/loja-demo/produtos/${e.id}`).fields}});for(const k of ['nome','preco','categoriaId','ativo','disponivel','descricao'])assert.deepEqual(d[k],e[k],`Divergência ${e.id}/${k}`);assert.deepEqual(d.ingredientes||[],e.beforeIngredients,`Ingredientes mudaram: ${e.id}`);}
  save('backup.json',{at:new Date().toISOString(),project:'bancorestaurante',documents},true);
  save('manifest.json',{proposalSha256:hash(fs.readFileSync(path.join(ROOT,'docs/ADAPTACAO_SERVERLESS/PROPOSTA_INGREDIENTES.json'))),backupSha256:hash(fs.readFileSync(path.join(DIR,'backup.json'))),paths:updates.map(e=>e.id),allowedSourceChanges:['ingredientes','atualizadoEm'],recovery:'Restaurar seletivamente campos anteriores com projeção/revisão; requer autorização própria. Verificação de restauração de conteúdo somente no Emulator.'},true);
  console.log(JSON.stringify({captured:documents.length,proposedChanges:6,writes:0}));return;
 }
 assert.equal(process.env.CATALOGOS_INGREDIENTES_APLICAR,'SEIS_LISTAS_LOJA_DEMO','Aplicação exige autorização delimitada.');
 const manifest=load('manifest.json');assert.equal(hash(fs.readFileSync(path.join(ROOT,'docs/ADAPTACAO_SERVERLESS/PROPOSTA_INGREDIENTES.json'))),manifest.proposalSha256);assert.equal(hash(fs.readFileSync(path.join(DIR,'backup.json'))),manifest.backupSha256);
 const emu=load('emulator.json');assert.equal(emu.status,'APROVADO');assert.equal(emu.backupSha256,manifest.backupSha256);
 const backup=load('backup.json');for(const d of backup.documents)assert.equal(canon((await get(d.path)).fields),canon(d.fields),'Catálogo mudou antes da aplicação: '+d.path);
 const journal={started:new Date().toISOString(),status:'EM_EXECUCAO',completed:[],pending:null};save('journal.json',journal,true);
 for(const e of updates){
  const orig=`lojas/loja-demo/produtos/${e.id}`,pub=`catalogosPublicos/loja-demo/produtos/${e.id}`,ctrl='lojas/loja-demo/controleCompra/versao';
  const [a,b,c]=await Promise.all([get(orig),get(pub),get(ctrl)]),old=backup.documents.find(d=>d.path===orig),oldPub=backup.documents.find(d=>d.path===pub);
  assert.equal(canon(a.fields),canon(old.fields),'Produto mudou: '+e.id);assert.equal(canon(b.fields),canon(oldPub.fields),'Projeção mudou: '+e.id);
  const source=decode({mapValue:{fields:a.fields}}),control=decode({mapValue:{fields:c.fields}}),projection=projetarRegistro('produtos',{...source,ingredientes:e.proposedIngredients});
  const initial=decode({mapValue:{fields:backup.documents.find(d=>d.path===ctrl).fields}}).revisao;assert.equal(control.revisao,initial+journal.completed.length,'Revisão concorrente.');
  const writes=[{update:{name:PREFIX+orig,fields:fields({ingredientes:e.proposedIngredients})},updateMask:{fieldPaths:['ingredientes']},updateTransforms:[{fieldPath:'atualizadoEm',setToServerValue:'REQUEST_TIME'}],currentDocument:{updateTime:a.updateTime}},
   {update:{name:PREFIX+pub,fields:fields(projection)},currentDocument:{updateTime:b.updateTime}},
   {update:{name:PREFIX+ctrl,fields:fields({revisao:control.revisao+1,alteracao:{tipo:'produtos',id:e.id}})},updateMask:{fieldPaths:['revisao','alteracao']},currentDocument:{updateTime:c.updateTime}}];
  journal.pending=e.id;save('journal.json',journal);
  await client.request({url:BASE+'projects/bancorestaurante/databases/(default)/documents:commit',method:'POST',data:{writes},retry:false,timeout:20000});
  const [aa,bb]=await Promise.all([get(orig),get(pub)]);assert.deepEqual(decode(aa.fields.ingredientes),e.proposedIngredients);assert.equal(canon(bb.fields),canon(fields(projection)));const strip=o=>Object.fromEntries(Object.entries(o).filter(([k])=>!['ingredientes','atualizadoEm'].includes(k)));assert.equal(canon(strip(aa.fields)),canon(strip(old.fields)));
  journal.completed.push(e.id);journal.pending=null;save('journal.json',journal);
 }
 for(const d of backup.documents.filter(d=>!d.path.includes('/produtos/')&&!d.path.endsWith('/controleCompra/versao')||d.path.includes('/produtos/')&&!updates.some(e=>d.path.endsWith('/'+e.id))))assert.equal(canon((await get(d.path)).fields),canon(d.fields),'Campo fora do escopo mudou.');
 journal.status='APROVADO';journal.finished=new Date().toISOString();save('journal.json',journal);console.log(JSON.stringify({status:'APROVADO',products:journal.completed.length,sourceProjectionPairs:6,revisionAdvances:6}));
}
main().catch(e=>{console.error(JSON.stringify({failed:true,status:e.response?.status,reason:e.response?.data?.error?.status||e.code||e.message.slice(0,220)}));process.exitCode=1;});
