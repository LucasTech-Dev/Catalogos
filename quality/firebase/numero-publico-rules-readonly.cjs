// Dois GET de Rules; não lê contas/pedidos nem publica configuração.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'../..'),r=createRequire(path.join(root,'backend/package.json')),{GoogleAuth}=r('google-auth-library');
(async()=>{
 const client=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/firebase.readonly']}).getClient();
 const get=async url=>(await client.request({url,method:'GET',retry:false,timeout:20000})).data;
 const release=await get('https://firebaserules.googleapis.com/v1/projects/bancorestaurante/releases/cloud.firestore');
 const rules=await get('https://firebaserules.googleapis.com/v1/'+release.rulesetName),files=rules.source.files;
 const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),before=fs.readFileSync(path.join(root,'quality/fixtures/firestore-antes-numero-publico.rules'),'utf8');
 const snapshotDir=path.join(root,'private-backups/numero-publico');fs.mkdirSync(snapshotDir,{recursive:true,mode:0o700});if(files.length===1)fs.writeFileSync(path.join(snapshotDir,'rules-publicadas.rules'),files[0].content,{mode:0o600});
 const normalizarQuebras=s=>s.replace(/\r\n/g,'\n').trimEnd();
 const out={baselineMatchesAfterLineEndingNormalization:files.length===1 && normalizarQuebras(files[0].content)===normalizarQuebras(before),at:new Date().toISOString(),project:'bancorestaurante',reads:2,writes:0,publishedRuleset:release.rulesetName,beforeSha256:sha(before),publishedSha256:files.length===1?sha(files[0].content):null,baselineMatchesPublished:files.length===1 && files[0].content===before};
 fs.writeFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/NUMERO_PUBLICO_RULES_LEITURA.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
})().catch(e=>{console.error(JSON.stringify({status:'LEITURA_NAO_CONFIRMADA',code:e.code||e.response?.status||null}));process.exitCode=1;});
