// Operação limitada à release cloud.firestore de bancorestaurante. Sem Auth/IAM/dados.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'../..'),r=createRequire(path.join(root,'backend/package.json')),{GoogleAuth}=r('google-auth-library');
const project='bancorestaurante',mode=process.argv[2],dir=path.join(root,'private-backups/numero-publico-publicacao'),manifestFile=path.join(dir,'rules-manifest.json'),base='https://firebaserules.googleapis.com/v1/',releaseName='projects/'+project+'/releases/cloud.firestore';
assert.ok(['prepare','activate','verify'].includes(mode));assert.equal(process.argv.length,3);
const sha=v=>crypto.createHash('sha256').update(v).digest('hex'),normalize=s=>s.replace(/\r\n/g,'\n').trimEnd();
const source=fs.readFileSync(path.join(root,'firebase/firestore.rules'),'utf8'),expected=JSON.parse(fs.readFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/NUMERO_PUBLICO_ARQUIVOS.json'))).files.find(f=>f.path==='firebase/firestore.rules').sha256;
assert.equal(sha(source),expected,'Rules locais mudaram depois dos testes.');
(async()=>{
 process.umask(0o077);fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const c=await new GoogleAuth({scopes:[mode==='verify'?'https://www.googleapis.com/auth/firebase.readonly':'https://www.googleapis.com/auth/firebase']}).getClient();
 const request=async(method,name,data)=>(await c.request({url:base+name,method,data,retry:false,timeout:30000})).data;
 const current=await request('GET',releaseName);
 if(mode==='prepare'){
  assert.ok(!fs.existsSync(manifestFile),'Preservar preparo existente.');
  const before=await request('GET',current.rulesetName),baseline=fs.readFileSync(path.join(root,'quality/fixtures/firestore-antes-numero-publico.rules'),'utf8');
  assert.equal(before.source.files.length,1);assert.equal(normalize(before.source.files[0].content),normalize(baseline),'Release real diverge da base revisada.');
  fs.writeFileSync(path.join(dir,'before-release.json'),JSON.stringify({release:current,ruleset:before},null,2)+'\n',{mode:0o600,flag:'wx'});
  const manifest={project,created:new Date().toISOString(),beforeRelease:current,sha256:sha(source),status:'CREATING_INACTIVE_RULESET'};fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n',{mode:0o600,flag:'wx'});
  const next=await request('POST','projects/'+project+'/rulesets',{source:{files:[{name:'firestore.rules',content:source}]}});
  assert.ok(next.name.startsWith('projects/'+project+'/rulesets/'));const read=await request('GET',next.name);assert.equal(read.source.files.length,1);assert.equal(read.source.files[0].content,source);
  Object.assign(manifest,{nextRuleset:next.name,status:'PREPARED',verified:true});fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({status:'PREPARED',ruleset:next.name,sha256:manifest.sha256,activeReleaseUnchanged:(await request('GET',releaseName)).rulesetName===current.rulesetName}));return;
 }
 const manifest=JSON.parse(fs.readFileSync(manifestFile));assert.equal(manifest.project,project);assert.equal(manifest.sha256,sha(source));
 if(mode==='activate'){
  assert.equal(process.env.CATALOGOS_NUMERO_RULES,'PUBLICACAO_AUTORIZADA');assert.equal(manifest.status,'PREPARED');assert.ok(Date.now()-Date.parse(manifest.created)<30*60*1000);assert.equal(current.rulesetName,manifest.beforeRelease.rulesetName,'Release mudou após preparação.');
  manifest.activationIntention=new Date().toISOString();fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');
  await request('PATCH',releaseName,{release:{name:releaseName,rulesetName:manifest.nextRuleset}});
 }
 const actual=await request('GET',releaseName),rules=await request('GET',actual.rulesetName);assert.equal(actual.rulesetName,manifest.nextRuleset);assert.equal(rules.source.files.length,1);assert.equal(rules.source.files[0].content,source);
 const out={at:new Date().toISOString(),project,status:'PUBLICADO_VERIFICADO',release:actual.name,ruleset:actual.rulesetName,previousRuleset:manifest.beforeRelease.rulesetName,sha256:sha(source),sourceMatches:true,authIamIndexesUnchanged:true,dataWritesPerformed:0};
 manifest.status=out.status;manifest.activatedAt=out.at;fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/NUMERO_PUBLICO_RULES_PUBLICADAS.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
})().catch(e=>{console.error(JSON.stringify({status:'INTERROMPIDO',phase:mode,code:e.code||e.response?.status||null,message:e instanceof assert.AssertionError?e.message.slice(0,180):'Consulte o estado sanitizado da operação; nenhum segredo foi impresso.'}));process.exitCode=1;});
