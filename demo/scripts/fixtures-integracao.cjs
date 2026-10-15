// Integração real de React compilado + Express local, sem SDK Firebase ou dados remotos.
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process'),Module=require('node:module');
const {chrome}=require('./lib/chrome.cjs');
const original=Module._load;Module._load=function(id,...args){if(/firebase-admin|google-auth-library/.test(id))throw Error('Firebase proibido na integração fixtures.');return original.call(this,id,...args);};
async function main(){
 const root=path.resolve(__dirname,'../..'),out=await fs.mkdtemp(path.join(os.tmpdir(),'catalogos-fixtures-web-'));
 let navegador,api,web;
 try{
  web=http.createServer(async(req,res)=>{try{
   const url=new URL(req.url,'http://localhost'),relative=url.pathname.startsWith('/assets/')?url.pathname.slice(1):'index.html';
   const file=path.resolve(out,relative);if(!file.startsWith(out+path.sep))throw Error();
   const data=await fs.readFile(file),ext=path.extname(file);
   res.writeHead(200,{'Content-Type':ext==='.js'?'application/javascript':ext==='.css'?'text/css':'text/html'});res.end(data);
  }catch{res.writeHead(404);res.end();}});
  await new Promise(r=>web.listen(0,'127.0.0.1',r));const origem='http://127.0.0.1:'+web.address().port;
  for(const key of Object.keys(process.env))if(/^(?:FIREBASE_|FIRESTORE_|GOOGLE_APPLICATION_CREDENTIALS$|GOOGLE_CLOUD_PROJECT$|GCLOUD_PROJECT$|CATALOGOS_DEMO_)/.test(key))delete process.env[key];
  Object.assign(process.env,{APP_ENV:'development',NODE_ENV:'development',CATALOGOS_RUNTIME_MODE:'public-fixture-demo',CATALOGOS_DEMO_LOJA_ID:'loja-demo',CORS_ORIGINS:origem,RATE_LIMIT_MODE:'enforce',HTTP_LOG_ENABLED:'1'});
  const app=require('../../backend/src/app');api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const base='http://127.0.0.1:'+api.address().port;
  const env={...process.env,VITE_APP_ENV:'development',VITE_CATALOGOS_RUNTIME_MODE:'public-fixture-demo',VITE_CATALOGOS_DEMO_LOJA_ID:'loja-demo',VITE_LOJA_ID:'loja-demo',VITE_API_URL:base};
  for(const key of Object.keys(env))if(key.startsWith('VITE_FIREBASE_') || key==='VITE_LOJAS_POR_HOST')delete env[key];
  const build=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--outDir',out,'--emptyOutDir'],{cwd:path.join(root,'demo'),env,encoding:'utf8',timeout:90000});
  assert.equal(build.status,0,build.stderr);
  navegador=await chrome();
  await navegador.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__demoRequests=[];const originalFetch=window.fetch;window.fetch=function(url,options){window.__demoRequests.push({url:String(url),method:options?.method || 'GET'});return originalFetch.call(this,url,options);};`});
  await navegador.navigate(origem+'/');await navegador.wait('document.body.textContent.includes("Prato da casa")');
  await navegador.click('a[href="/cardapio"]');await navegador.click('a[href="/produto?id=prato-teste"]');await navegador.wait('document.querySelector("h1")?.textContent==="Prato da casa"');
  await navegador.click('button[aria-label="Adicionar Prato da casa"]');await navegador.click('a[href="/carrinho"]');
  await navegador.wait('document.body.textContent.includes("Total demonstrativo: R$ 20,00")');
  await navegador.click('button[aria-label="Aumentar Prato da casa"]');await navegador.wait('document.body.textContent.includes("Total demonstrativo: R$ 40,00")');
  await navegador.click('button[aria-label="Diminuir Prato da casa"]');await navegador.click('button[aria-label="Remover Prato da casa"]');await navegador.wait('document.body.textContent.includes("Seu carrinho está vazio")');
  const requests=await navegador.evaluate('window.__demoRequests');assert.ok(requests.length>0);assert.ok(requests.every(r=>r.url===base+'/publico/lojas/loja-demo/catalogo' && r.method==='GET'));
  assert.equal((await fetch(base+'/')).status,200);assert.equal((await fetch(base+'/publico/lojas/loja-demo/catalogo',{headers:{Origin:'https://negada.example'}})).status,403);
  const resources=await navegador.evaluate('performance.getEntriesByType("resource").map(r=>r.name)');assert.ok(!resources.some(r=>/googleapis|firebaseio|identitytoolkit|securetoken/.test(r)));
  await navegador.navigate(origem+'/admin');await navegador.wait('document.body.textContent.includes("Recurso indisponível")');assert.deepEqual(await navegador.evaluate('window.__demoRequests'),[]);
  await navegador.navigate(origem+'/cardapio');await navegador.wait('document.body.textContent.includes("Prato da casa")');
  await navegador.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  assert.equal(await navegador.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),true);
  await navegador.screenshot('/tmp/catalogos-fixtures-mobile.png');assert.deepEqual(navegador.errors,[]);
  console.log('React + Express: catálogo via HTTP, detalhe, carrinho/quantidades/remoção, admin bloqueado, CORS e viewport mobile aprovados. Sem Firebase, pedidos ou armazenamento persistente.');
 }finally{
  if(navegador)await navegador.close();for(const server of [api,web])if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}
  await fs.rm(out,{recursive:true,force:true});
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
