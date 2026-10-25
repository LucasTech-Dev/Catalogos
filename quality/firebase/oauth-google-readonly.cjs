// Consulta pontual OAuth; não lista usuários nem modifica o Firebase.
const fs=require('node:fs'),path=require('node:path');
const {GoogleAuth}=require('../../backend/node_modules/google-auth-library');
(async()=>{
 const c=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']}).getClient();
 const get=async url=>(await c.request({url,method:'GET',retry:false,timeout:20000})).data;
 const cfg=await get('https://identitytoolkit.googleapis.com/admin/v2/projects/bancorestaurante/config');
 const google=await get('https://identitytoolkit.googleapis.com/admin/v2/projects/bancorestaurante/defaultSupportedIdpConfigs/google.com');
 const env=Object.fromEntries(fs.readFileSync(path.resolve(__dirname,'../../private-backups/homologacao-real-011/firebase-public.env'),'utf8').split('\n').filter(l=>l.startsWith('VITE_')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)];}));
 const summary={at:new Date().toISOString(),project:'bancorestaurante',authDomain:env.VITE_FIREBASE_AUTH_DOMAIN,webProjectMatches:env.VITE_FIREBASE_PROJECT_ID==='bancorestaurante',googleEnabled:google.enabled===true,authorizedDomains:cfg.authorizedDomains||[],pagesDomainAuthorized:(cfg.authorizedDomains||[]).includes('catalogo-demo-cz1.pages.dev'),remoteWrites:0};
 fs.writeFileSync(path.resolve(__dirname,'../../docs/ADAPTACAO_SERVERLESS/GOOGLE_OAUTH_DOMINIO_EVIDENCIAS.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
})().catch(e=>{console.error(JSON.stringify({failed:true,status:e.response?.status||null,code:e.code||null}));process.exitCode=1;});
