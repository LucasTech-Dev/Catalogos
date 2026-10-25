import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {build} from 'vite';
const require=createRequire(import.meta.url),{chrome}=require('./lib/chrome.cjs');

// React compilado + Web SDK + banco sintético real no Emulator. Sem API de fixtures.
export async function verificarNavegador({projectId,host,authHost,atualizarProduto}) {
  const env={VITE_APP_ENV:'test',VITE_CATALOGOS_RUNTIME_MODE:'full',VITE_LOJA_ID:'loja-a',VITE_LOJAS_POR_HOST:JSON.stringify({'127.0.0.1':'loja-a',localhost:'loja-b'}),VITE_FIREBASE_PROJECT_ID:projectId,VITE_FIREBASE_API_KEY:'fake-api-key',VITE_FIREBASE_APP_ID:'fake-app',VITE_FIREBASE_AUTH_DOMAIN:'localhost',VITE_FIREBASE_AUTH_EMULATOR_URL:'http://'+authHost,VITE_FIRESTORE_EMULATOR_HOST:host,VITE_API_URL:'http://127.0.0.1:1',MODE:'test',DEV:false,PROD:true,BASE_URL:'/'};
  const result=await build({root:new URL('../../../frontend/',import.meta.url).pathname,envFile:false,define:Object.fromEntries(Object.entries(env).map(([k,v])=>['import.meta.env.'+k,JSON.stringify(v)])),plugins:[{name:'quality-pausar-leitura-inicial',transform(code,id){if(id.endsWith('/services/catalogo.js'))return code.replace('return consultarCatalogo(db,lojaId);','await globalThis.__esperaCatalogo;return consultarCatalogo(db,lojaId);');}}],build:{write:false},logLevel:'error'});
  const arquivos=new Map(result.output.map(o=>['/'+o.fileName,o.type==='asset'?o.source:o.code]));
  const servidor=http.createServer(async(req,res)=>{
    const pathname=new URL(req.url,'http://localhost').pathname;
    let data=arquivos.get(pathname),tipo='text/html';
    if(pathname.endsWith('.js'))tipo='application/javascript';else if(pathname.endsWith('.css'))tipo='text/css';
    if(data===undefined && pathname.endsWith('.svg')){try{data=await readFile(new URL('../../../frontend/public'+pathname,import.meta.url));tipo='image/svg+xml';}catch{}}
    if(data===undefined)data=arquivos.get('/index.html');
    res.writeHead(200,{'Content-Type':tipo});res.end(data);
  });
  let browser,checks=0;
  const check=(c,msg)=>{assert.ok(c,msg);checks++;};
  try{
    await new Promise(r=>servidor.listen(0,'127.0.0.1',r));
    const porta=servidor.address().port,base='http://127.0.0.1:'+porta;
    browser=await chrome();const requests=[],externos=new Set(),bloqueados=new Set();
    await browser.send('Network.setBlockedURLs',{urls:['https://*','http://*.googleapis.com/*','http://*.firebaseio.com/*']});
    browser.onEvent(m=>{if(m.method==='Network.requestWillBeSent'){const u=m.params.request.url;requests.push(u);if(/^https?:/.test(u) && !['localhost','127.0.0.1'].includes(new URL(u).hostname))externos.add(m.params.requestId);}if(m.method==='Network.loadingFailed' && m.params.blockedReason)bloqueados.add(m.params.requestId);});
    await browser.send('Page.addScriptToEvaluateOnNewDocument',{source:`if(location.hostname==='127.0.0.1'&&!sessionStorage.getItem('quality-loading-checked')){sessionStorage.setItem('quality-loading-checked','1');globalThis.__esperaCatalogo=new Promise(r=>globalThis.__liberarCatalogo=r);}`});
    await browser.navigate(base+'/');
    await browser.wait('Boolean(document.querySelector(".site-header"))&&Boolean(document.querySelector(".page-loader"))');
    check(await browser.evaluate('document.querySelectorAll(".product-card").length===0&&document.body.textContent.includes("Carregando...")'),'Entrada lenta mantém navegação visível sem produtos/parciais');
    const capturas=process.env.CATALOGOS_LOADING_CAPTURES;
    if(capturas){await mkdir(capturas,{recursive:true});await browser.screenshot(capturas+'/desktop.png');}
    await browser.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    check(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth'),'Loader móvel sem transbordamento');
    if(capturas)await browser.screenshot(capturas+'/mobile.png');
    await browser.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    check(await browser.evaluate('getComputedStyle(document.querySelector(".page-loader-spinner")).animationName==="none"'),'Respeita preferência de movimento reduzido');
    await browser.send('Emulation.setEmulatedMedia',{features:[]});
    await browser.send('Emulation.clearDeviceMetricsOverride');
    await browser.evaluate('__liberarCatalogo()');
    await browser.wait('document.body.textContent.includes("Prato atualizado")');checks++;
    await browser.navigate(base+'/produto?id=inexistente');
    await browser.wait('document.body.textContent.includes("Produto não encontrado")');checks++;
    await browser.navigate(base+'/cardapio');
    await browser.wait('document.body.textContent.includes("Prato atualizado")');
    check(await browser.evaluate('document.querySelectorAll(".menu-products .product-card").length===2'),'Cardápio React recebe somente produtos públicos');
    await browser.navigate(base+'/produto?id=prato');
    await browser.wait('document.querySelector("h1")?.textContent==="Prato atualizado"');
    check(await browser.evaluate('document.querySelector(".product-detail-price").textContent.includes("23,00")'),'Detalhe usa preço Firestore');
    await browser.click('.add-to-cart-button');
    await browser.navigate(base+'/carrinho');
    await browser.wait('document.querySelector(".summary-total")?.textContent.includes("28,00")');
    await browser.send('Page.reload');
    await browser.wait('document.querySelector(".summary-total")?.textContent.includes("28,00")');checks++;
    await atualizarProduto({preco:25});
    await browser.evaluate('window.dispatchEvent(new Event("focus"))');
    await browser.wait('document.querySelector(".summary-total")?.textContent.includes("30,00")');checks++;
    await browser.navigate('http://localhost:'+porta+'/cardapio');
    await browser.wait('document.body.textContent.includes("Prato loja-b")');
    check(!await browser.evaluate('document.body.textContent.includes("Prato atualizado")'),'Outra loja não reutiliza catálogo anterior');
    await browser.navigate('http://localhost:'+porta+'/carrinho');
    await browser.wait('document.body.textContent.includes("Seu carrinho está vazio")');checks++;
    await browser.navigate(base+'/cardapio');
    await browser.wait('document.body.textContent.includes("Prato atualizado")');
    await browser.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    check(await browser.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),'Layout móvel sem transbordamento');
    await browser.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
    await browser.evaluate('window.dispatchEvent(new Event("focus"))');
    await browser.wait('Boolean(document.querySelector("[role=alert]"))',40000);checks++;
    await browser.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
    await browser.click('[role=alert] button');
    await browser.wait('!document.querySelector("[role=alert]") && document.body.textContent.includes("Prato atualizado")');checks++;
    check(!requests.some(u=>/\/publico\/|onrender\.com/.test(u)),'Catálogo não depende de Express/Render');
    check([...externos].every(id=>bloqueados.has(id)),'Todo destino externo bloqueado antes de acesso; SDK Auth pode pré-carregar script público');
    check(browser.errors.length===0,'Sem exceção JavaScript');
    console.log(JSON.stringify({browser:'aprovado',checks,build:'aprovado',destinosExternosBloqueados:externos.size,saidas:result.output.length,distAlterado:false}));
    return {checks,saidas:result.output.length};
  }catch(error){if(browser)console.error(JSON.stringify({diagnosticoLocal:await browser.evaluate('document.body.textContent.slice(0,700)'),excecoes:browser.errors,console:browser.consoleErrors}));throw error;}finally{if(browser)await browser.close();await new Promise(r=>servidor.close(r));}
}
