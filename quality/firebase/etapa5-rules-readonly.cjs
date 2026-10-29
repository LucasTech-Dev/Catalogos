// Etapa5: somente GET Rules; fonte genérica vira fixture de regressão local.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
(async()=>{
 const {GoogleAuth}=require(path.join(root,'backend/node_modules/google-auth-library'));
 const client=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/firebase.readonly']}).getClient();
 const get=async url=>(await client.request({url,method:'GET',retry:false,timeout:15000})).data;
 const release=await get('https://firebaserules.googleapis.com/v1/projects/bancorestaurante/releases/cloud.firestore');
 if(!/^projects\/bancorestaurante\/rulesets\/[^/]+$/.test(release.rulesetName))throw Error('Alvo inesperado.');
 const result=await get('https://firebaserules.googleapis.com/v1/'+release.rulesetName);
 if(result.source.files.length!==1)throw Error('Revisar múltiplos arquivos.');
 const source=result.source.files[0].content,candidate=fs.readFileSync(path.join(root,'firebase/firestore.rules'),'utf8');
 fs.writeFileSync(path.join(root,'quality/fixtures/firestore-publicadas-etapa5.rules'),source);
 const out={at:new Date().toISOString(),status:'APROVADO_GET_ONLY',project:'bancorestaurante',reads:2,writes:0,publishedSha256:sha(source),candidateSha256:sha(candidate),equal:source===candidate};
 fs.writeFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/ETAPA5_RULES_LEITURA.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
})().catch(e=>{console.error('Leitura Rules não confirmada: '+(e.response?.status||e.code||'credencial_indisponivel'));process.exitCode=1;});
