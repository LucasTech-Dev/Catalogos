import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'vite';
const require=createRequire(import.meta.url),{chrome}=require('./lib/chrome.cjs');
export async function verificarNumeroMobile({project,host,authHost,email,adminEmail,contarPedidos}){
 assert.equal(project,'demo-numero-publico');assert.equal(host,'127.0.0.1:8188');assert.equal(authHost,'127.0.0.1:9198');
 const env={VITE_APP_ENV:'test',VITE_CATALOGOS_RUNTIME_MODE:'full',VITE_LOJA_ID:'a',VITE_FIREBASE_PROJECT_ID:project,VITE_FIREBASE_API_KEY:'fake-api-key',VITE_FIREBASE_APP_ID:'fake-app',VITE_FIREBASE_AUTH_DOMAIN:'localhost',VITE_FIREBASE_AUTH_EMULATOR_URL:'http://'+authHost,VITE_FIRESTORE_EMULATOR_HOST:host,MODE:'test',DEV:false,PROD:true,BASE_URL:'/'};
 const result=await build({root:new URL('../../../frontend/',import.meta.url).pathname,envFile:false,define:Object.fromEntries(Object.entries(env).map(([k,v])=>['import.meta.env.'+k,JSON.stringify(v)])),build:{write:false},logLevel:'error'});
 const files=new Map(result.output.map(o=>['/'+o.fileName,o.type==='asset'?o.source:o.code]));
 const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname;res.writeHead(200,{'Content-Type':p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html'});res.end(files.get(p)??files.get('/index.html'));});
 let b,checks=0;const ok=(v,msg)=>{assert.ok(v,msg);checks++;};
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;b=await chrome();
  const ios='Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1';
  await b.send('Network.setUserAgentOverride',{userAgent:ios});await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'delete String.prototype.isWellFormed;'});
  // Retém a importação de App após o timeout visual, depois permite sua conclusão.
  const pendentes=[];let segurar=true;
  const off=b.onEvent(m=>{if(m.method==='Fetch.requestPaused'){if(segurar)pendentes.push(m.params.requestId);else void b.send('Fetch.continueRequest',{requestId:m.params.requestId});}});
  await b.send('Fetch.enable',{patterns:[{urlPattern:'*assets/App-*.js',requestStage:'Request'}]});
  await b.navigate(base+'/cardapio');await b.wait('document.body.textContent.includes("O carregamento ainda não terminou")',30000);ok(pendentes.length>0,'timeout visual sem travar importação');
  segurar=false;await Promise.all(pendentes.map(requestId=>b.send('Fetch.continueRequest',{requestId})));await b.send('Fetch.disable');off();
  await b.wait('document.querySelectorAll(".menu-products .product-card").length===50',45000);checks++;
  await b.send('Network.setBlockedURLs',{urls:['*identitytoolkit*','*securetoken*','*.jpg','*.png','*.webp']});
  await b.send('Network.emulateNetworkConditions',{offline:false,latency:300,downloadThroughput:160000,uploadThroughput:80000});
  for(const [ua,width] of [[ios,390],[ios+' WhatsApp/2.26.1',320],['Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',360]]){
   await b.send('Network.setUserAgentOverride',{userAgent:ua});await b.send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await b.navigate(base+'/cardapio');await b.wait('document.querySelectorAll(".menu-products .product-card").length===50',45000);
   ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'catálogo mobile sem transbordamento '+width);ok(await b.evaluate('!document.querySelector(".page-loader-error")'),'catálogo sem Auth e sem imagens essenciais '+width);
  }
  await b.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});await b.evaluate('window.dispatchEvent(new Event("focus"))');await b.wait('Boolean(document.querySelector("[role=alert]"))');ok(await b.evaluate('document.querySelectorAll(".menu-products .product-card").length===50'),'conteúdo válido permanece em falha temporária');
  await b.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});await b.evaluate('window.dispatchEvent(new Event("online"))');await b.wait('!document.querySelector("[role=alert]")');checks++;
  await b.send('Network.setBlockedURLs',{urls:['*://wa.me/*']});
  async function login(e){await b.navigate(base+'/login');await b.fill('#email',e);await b.fill('#password','Senha-sintetica-123!');await b.click('.login-submit');await b.wait('location.pathname!=="/login"');}
  await login(email);await b.navigate(base+'/produto?id=p0');await b.wait('document.querySelector(".add-to-cart-button")?.disabled===false');await b.click('.add-to-cart-button');
  await b.navigate(base+'/checkout');await b.wait('Boolean(document.querySelector("#nome"))');await b.fill('#nome','Cliente sintético');await b.fill('#telefone','51999999999');await b.click('.delivery-option:last-child');
  await b.click('.delivery-option:first-child');await b.fill('#uf','xx');await b.fill('#cidade','Porto Alegre');await b.fill('#endereco','Rua de exemplo');await b.fill('#numero','1');await b.fill('#bairro','Centro');const antesUF=await contarPedidos();
  ok(await b.evaluate('document.querySelector("#uf").placeholder==="Ex.: RS" && document.querySelector("#uf-ajuda").textContent.includes("Estado")'),'orientação UF');
  await b.evaluate('[...document.querySelectorAll("button")].find(b=>b.textContent.includes("Registrar pedido e preparar WhatsApp")).click()');await b.wait('document.querySelector("#uf").getAttribute("aria-invalid")==="true"');ok(await contarPedidos()===antesUF,'UF inválida sem gravação');
  await b.fill('#uf','rs');await b.click('.delivery-option:last-child');await b.click('.delivery-option:first-child');ok(await b.evaluate('document.querySelector("#uf").value==="RS"'),'UF preservada e maiúscula');
  await b.fill('.checkout-observation','Sem cebola. Molho à parte.');
  const before=await contarPedidos();await b.evaluate('[...document.querySelectorAll("button")].find(b=>b.textContent.includes("Registrar pedido e preparar WhatsApp")).click()');
  await b.wait(`Boolean(document.querySelector('.checkout-confirmation a[href*="wa.me"]'))`,60000);
  const confirmation=await b.evaluate(`(()=>{const box=document.querySelector('.checkout-confirmation'),url=new URL(box.querySelector('a[href*="wa.me"]').href),id=new URL(box.querySelector('a[href*="/perfil/pedido?id="]').href).searchParams.get('id');return {number:box.querySelector('.checkout-public-number').textContent.trim(),text:url.searchParams.get('text'),technicalIdAbsent:!box.textContent.includes(id)&&!url.searchParams.get('text').includes(id),noSubmit:![...document.querySelectorAll('button')].some(b=>b.textContent.includes('Registrar pedido')),overflow:document.documentElement.scrollWidth>innerWidth+2}})()`);
  ok(/^#\d+$/.test(confirmation.number),'número comercial na confirmação');ok(confirmation.text.includes(confirmation.number)&&confirmation.technicalIdAbsent,'WhatsApp somente referência comercial');ok(confirmation.noSubmit&&!confirmation.overflow,'confirmação separada sem novo registro e sem transbordamento');
  ok(await contarPedidos()===before+1,'uma única criação');await b.send('Page.reload');await b.wait('Boolean(document.querySelector(".checkout-confirmation"))',45000);ok(await contarPedidos()===before+1,'recarregar sem duplicar');
  ok(await b.evaluate('!document.querySelector("#nome") && ![...document.querySelectorAll("button")].some(b=>b.textContent.includes("Registrar pedido"))'),'formulário permanece indisponível após reload');
  const screenshotDir=new URL('../../../docs/ADAPTACAO_SERVERLESS/EVIDENCIAS_CHECKOUT_MOBILE/',import.meta.url);await fs.mkdir(screenshotDir,{recursive:true});
  for(const width of [320,360,390,1366]){
    await b.send('Emulation.setDeviceMetricsOverride',{width,height:960,deviceScaleFactor:1,mobile:width<600});
    const visual=await b.evaluate(`(()=>{const card=document.querySelector('.checkout-confirmation'),button=card.querySelector('.whatsapp-checkout-button'),r=card.getBoundingClientRect(),view=document.documentElement.clientWidth;return {background:getComputedStyle(card).backgroundColor,radius:getComputedStyle(card).borderRadius,buttonBackground:getComputedStyle(button).backgroundColor,buttonHeight:button.getBoundingClientRect().height,headingSize:parseFloat(getComputedStyle(card.querySelector('h1')).fontSize),centered:Math.abs(r.left-(view-r.right))<2,overflow:document.documentElement.scrollWidth>view+1,successIcon:Boolean(card.querySelector('.checkout-success-icon svg'))}})()`);
    ok(visual.background==='rgb(255, 255, 255)'&&parseFloat(visual.radius)>=18&&visual.headingSize>=25,'estilos de confirmação carregados '+width);
    ok(visual.buttonBackground==='rgb(21, 128, 61)'&&visual.buttonHeight>=48&&visual.successIcon,'botão verde e ícone de sucesso '+width);
    ok(visual.centered&&!visual.overflow,'card centralizado sem transbordamento '+width);
    if(width===390||width===320)await b.screenshot(path.join(screenshotDir.pathname,'sucesso-android-'+width+'.png'));
  }
  await b.navigate(base+'/perfil/pedidos');await b.wait('Boolean(document.querySelector("#busca-pedidos"))');await b.fill('#busca-pedidos',confirmation.number);await b.wait('document.querySelectorAll(".order-card").length===1');checks++;
  await b.navigate(base+'/checkout');await b.wait('Boolean(document.querySelector(".checkout-confirmation"))');await b.click('.checkout-new-order');await b.wait('location.pathname==="/cardapio"');ok(await contarPedidos()===before+1,'novo fluxo preserva pedido anterior');await b.navigate(base+'/checkout');await b.wait('Boolean(document.querySelector("#nome"))');ok(!await b.evaluate('Boolean(document.querySelector(".checkout-confirmation"))'),'novo checkout depende de ação explícita, sem pedido automático');
  await b.navigate(base+'/perfil');await b.click('.profile-logout');await login(adminEmail);await b.wait('Boolean(document.querySelector(".admin-topbar"))');await b.navigate(base+'/admin/pedidos');await b.fill('#busca-admin-pedido',confirmation.number);await b.click('.admin-order-search button');await b.wait('document.querySelectorAll(".admin-order-row").length===1');checks++;
  ok(b.errors.length===0,'sem exceções JS');return {checks,widths:[320,360,390],engine:'Chrome com UA simulada; não WebKit/iPhone real',slowNetwork:true,offlineRecovery:true,delayedBootstrapRecovery:true,authBlockedPublicCatalog:true,syntheticBrowserOrders:1,checkoutCssVerified:true,ufInvalidBlocked:true,newFlowNoAutomaticOrder:true,screenshots:['EVIDENCIAS_CHECKOUT_MOBILE/sucesso-android-320.png','EVIDENCIAS_CHECKOUT_MOBILE/sucesso-android-390.png']};
 }catch(e){if(b)console.error(JSON.stringify({checks,browserFailure:e.message,path:await b.evaluate('location.pathname'),alerts:await b.evaluate('[...document.querySelectorAll("[role=alert]")].map(n=>n.textContent)')}));throw e;}finally{if(b)await b.close();await new Promise(r=>server.close(r));}
}
