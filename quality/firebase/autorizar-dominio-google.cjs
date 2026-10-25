// Preparação restrita: executar --apply SOMENTE após autorização específica do proprietário.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {GoogleAuth}=require('../../backend/node_modules/google-auth-library');
const project='bancorestaurante',domain='catalogo-demo-cz1.pages.dev';
assert.equal(process.argv[2],'--apply');assert.equal(process.env.CATALOGOS_AUTORIZAR_DOMINIO_PAGES,domain,'Exige autorização específica para este domínio/projeto.');
process.umask(0o077);
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
(async()=>{
 const c=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']}).getClient();
 const url='https://identitytoolkit.googleapis.com/admin/v2/projects/'+project+'/config';
 const get=async()=>(await c.request({url,method:'GET',retry:false,timeout:20000})).data;
 const before=await get(),domains=before.authorizedDomains||[];
 const dir=path.resolve(__dirname,'../../private-backups/oauth-dominio-20261025');fs.mkdirSync(dir,{recursive:true,mode:0o700});
 fs.writeFileSync(path.join(dir,'config-before-'+Date.now()+'.json'),JSON.stringify(before),{mode:0o600,flag:'wx'});
 if(!domains.includes(domain))await c.request({url:url+'?updateMask=authorizedDomains',method:'PATCH',data:{authorizedDomains:[...domains,domain]},retry:false,timeout:20000});
 const after=await get(),expected=domains.includes(domain)?domains:[...domains,domain];
 assert.deepEqual(after.authorizedDomains,expected);
 const other=v=>{const x=structuredClone(v);delete x.authorizedDomains;return x;};assert.equal(hash(other(before)),hash(other(after)),'Configuração não relacionada divergiu.');
 const summary={at:new Date().toISOString(),project,domain,operation:domains.includes(domain)?'already-authorized':'added-only-domain',beforeDomains:domains,afterDomains:after.authorizedDomains,otherConfigPreserved:true,otherConfigSha256:hash(other(after)),remoteWrites:domains.includes(domain)?0:1,updateMask:'authorizedDomains'};
 fs.writeFileSync(path.resolve(__dirname,'../../docs/ADAPTACAO_SERVERLESS/GOOGLE_OAUTH_DOMINIO_APLICADO_EVIDENCIAS.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
})().catch(e=>{console.error(JSON.stringify({failed:true,status:e.response?.status||null,code:e.code||null,message:e instanceof assert.AssertionError?e.message:'Operação não concluída. Conferir evidências locais sem expor credenciais.'}));process.exitCode=1;});
