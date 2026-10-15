const assert=require('node:assert/strict');
Object.assign(process.env,{APP_ENV:'homologacao',NODE_ENV:'production',GCLOUD_PROJECT:'catalogos-http-ficticio',FIREBASE_EXPECTED_PROJECT_ID:'catalogos-http-ficticio',CORS_ORIGINS:'https://catalogo-demo-cz1.pages.dev',RATE_LIMIT_MODE:'enforce',HTTP_LOG_ENABLED:'1'});
for(const k of ['GOOGLE_APPLICATION_CREDENTIALS','FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST'])delete process.env[k];
const app=require('../../backend/src/app');
const server=app.listen(0,'0.0.0.0',async()=>{try{
const base='http://127.0.0.1:'+server.address().port;
for(const [path,opts,status] of [['/',{},200],['/',{headers:{Origin:process.env.CORS_ORIGINS}},200],['/',{headers:{Origin:'https://negada.example'}},403],['/usuarios/me',{},401],['/admin/lojas/ficticia/sessao',{},401],['/lojas/ficticia/pedidos',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'},401],['/inexistente',{},404],['/usuarios/me',{method:'OPTIONS',headers:{Origin:process.env.CORS_ORIGINS}},204]]){
 const r=await fetch(base+path,opts);assert.equal(r.status,status);if(opts.headers?.Origin===process.env.CORS_ORIGINS)assert.equal(r.headers.get('access-control-allow-origin'),process.env.CORS_ORIGINS);console.log(opts.method||'GET',path,status);
}console.log('8 checks HTTP aprovados; nenhum token ou consulta Firebase utilizado.');
}catch(e){console.error(e);process.exitCode=1;}finally{server.close();}});
