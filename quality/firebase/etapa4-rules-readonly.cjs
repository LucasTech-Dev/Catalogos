// Exclusivamente GET Rules publicadas. Não lê documentos comerciais/contas.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
(async()=>{
 const {GoogleAuth}=require(path.join(root,'backend/node_modules/google-auth-library'));
 const client=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/firebase.readonly']}).getClient();
 const get=async url=>(await client.request({url,method:'GET',retry:false,timeout:15000})).data;
 const release=await get('https://firebaserules.googleapis.com/v1/projects/bancorestaurante/releases/cloud.firestore');
 if(!/^projects\/bancorestaurante\/rulesets\/[^/]+$/.test(release.rulesetName))throw Error('Alvo Rules inesperado.');
 const rules=await get('https://firebaserules.googleapis.com/v1/'+release.rulesetName);
 const published=rules.source.files.map(f=>f.content).join('\n'),candidate=fs.readFileSync(path.join(root,'firebase/firestore.rules'),'utf8');
 const before=JSON.parse(fs.readFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/ORDEM_013_FIREBASE_LEITURA.json')));
 const out={at:new Date().toISOString(),status:'LEITURA_CONFIRMADA',project:'bancorestaurante',method:'GET_ONLY',reads:2,writes:0,publishedSha256:hash(published),candidateSha256:hash(candidate),equal:published===candidate,igualPublicadoOrdem013:hash(published)===before.rulesSha256};
 fs.writeFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/ETAPA4_RULES_LEITURA.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
})().catch(e=>{const out={at:new Date().toISOString(),status:'LEITURA_NAO_CONFIRMADA',code:e.response?.status||e.code||'credencial_indisponivel',writes:0};fs.writeFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/ETAPA4_RULES_LEITURA.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));process.exitCode=1;});
