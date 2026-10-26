import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {build} from 'vite';
const require=createRequire(import.meta.url),{chrome}=require('./lib/chrome.cjs');
export async function verificarAdminPedidosNavegador({projectId,host,authHost,lojaId,email,emailCliente,emailOutraLoja,produtoId,preparar,localizar}){
 assert.match(projectId,/^demo-/);for(const h of [host,authHost])assert.match(h,/^(127\.0\.0\.1|localhost):\d+$/);
 const env={VITE_APP_ENV:'test',VITE_CATALOGOS_RUNTIME_MODE:'full',VITE_LOJA_ID:lojaId,VITE_FIREBASE_PROJECT_ID:projectId,VITE_FIREBASE_API_KEY:'fake-api-key',VITE_FIREBASE_APP_ID:'fake-app',VITE_FIREBASE_AUTH_DOMAIN:'localhost',VITE_FIREBASE_AUTH_EMULATOR_URL:'http://'+authHost,VITE_FIRESTORE_EMULATOR_HOST:host,VITE_API_URL:'http://127.0.0.1:1',MODE:'test',DEV:false,PROD:true,BASE_URL:'/'};
 const result=await build({root:new URL('../../../frontend/',import.meta.url).pathname,envFile:false,define:Object.fromEntries(Object.entries(env).map(([k,v])=>['import.meta.env.'+k,JSON.stringify(v)])),plugins:[{name:'quality-pedido007',transform(code,id){if(id.endsWith('/lib/firebase.js'))return code+'\nglobalThis.__firebase={auth,db,sessao};';}}],build:{write:false},logLevel:'error'});
 const arquivos=new Map(result.output.map(o=>['/'+o.fileName,o.type==='asset'?o.source:o.code]));
 const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname;res.writeHead(200,{'Content-Type':p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html'});res.end(arquivos.get(p) ?? arquivos.get('/index.html'));});
 let browser,checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  browser=await chrome();const requests=[];browser.onEvent(m=>{if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);if(m.method==='Page.javascriptDialogOpening')browser.send('Page.handleJavaScriptDialog',{accept:true});});await browser.send('Network.setBlockedURLs',{urls:['https://*']});
  async function login(conta){await browser.wait('Boolean(document.querySelector("#admin-email"))');await browser.fill('#admin-email',conta);await browser.fill('#admin-senha','Senha-local-teste-123!');await browser.click('.login-form button[type=submit]');}
  await browser.navigate(base+'/login');await browser.wait('Boolean(document.querySelector("#email"))');await browser.fill('#email',emailCliente);await browser.fill('#password','Senha-local-teste-123!');await browser.click('.login-form button[type=submit]');await browser.wait('location.pathname==="/perfil"');checks++;
  await browser.wait('Boolean(globalThis.__firebase?.auth.currentUser)');
  const uid=await browser.evaluate('globalThis.__firebase.auth.currentUser.uid');await preparar(uid);
  await browser.navigate(base+'/produto?id='+produtoId);await browser.wait('document.querySelector(".add-to-cart-button")?.disabled===false');await browser.click('.add-to-cart-button');
  await browser.navigate(base+'/checkout');await browser.wait('Boolean(globalThis.__firebase?.auth.currentUser) && document.querySelector("button.whatsapp-checkout-button")?.disabled===false && document.querySelector(".delivery-option:last-child")?.disabled===false');await browser.fill('#nome','Cliente navegador007');await browser.fill('#telefone','51999999999');await browser.click('.delivery-option:last-child');await browser.fill('.checkout-observation','Compra navegador007');
  await browser.click('button.whatsapp-checkout-button');await browser.wait('Boolean(document.querySelector("a.whatsapp-checkout-button"))');checks++;
  const compra=await localizar();ok(compra.status==='recebido' && compra.pagamento.status==='pendente','checkout navegador persistiu pedido pendente');
  await browser.navigate(base+'/admin/pedidos');await login(email);await browser.wait('document.querySelectorAll(".admin-order-row").length===25');checks++;
  await browser.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent==="Próxima página").click()');await browser.wait('Array.from(document.querySelectorAll("button")).find(b=>b.textContent==="Anterior")?.disabled===false');checks++;
  await browser.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent==="Entregue").click()');await browser.wait('document.querySelectorAll(".admin-order-row").length>0 && Array.from(document.querySelectorAll(".admin-order-status")).every(e=>e.textContent.includes("Entregue"))');checks++;
  await browser.navigate(base+'/admin/pedido?id='+compra.id);await browser.wait('document.body.textContent.includes("Confirmar pagamento")');ok(await browser.evaluate('document.body.textContent.includes("Compra navegador007")'),'detalhes do checkout no painel');
  await browser.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent==="Confirmar pagamento").click()');await browser.wait('Boolean(document.querySelector("[role=dialog]"))');ok((await localizar()).pagamento.status==='pendente','modal exige confirmacao explicita');ok(await browser.evaluate('document.querySelector("[role=dialog]").textContent.includes("não comprova liquidação")'),'origem manual clara');
  await browser.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent==="Confirmar").click()');await browser.wait('document.querySelector("[role=status]")?.textContent.includes("Registro manual")');ok((await localizar()).pagamento.registroManual.origem==='manual_estabelecimento','registro financeiro manual persistido');
  for(const status of ['pagamento_confirmado','em_preparacao','pronto','entregue']){
   await browser.fill('.admin-status-select',status);await browser.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.includes("Salvar status")).click()');
   await browser.wait(`document.querySelector('.admin-status-select')?.value===${JSON.stringify(status)} && document.querySelector('[role=status]')?.textContent==='Status do pedido atualizado com sucesso!'`);checks++;
  }
  ok((await localizar()).status==='entregue','pedido entregue persistido');
  await browser.click('.admin-order-toolbar button');await browser.wait('document.querySelector(".toast-card")?.textContent.includes("Pedido atualizado.")');checks++;
  const pasta=new URL('../../../docs/ADAPTACAO_SERVERLESS/EVIDENCIAS_ADMIN_PEDIDO/',import.meta.url);await mkdir(pasta,{recursive:true});
  for(const width of [320,360,390,1366]){
   await browser.send('Emulation.setDeviceMetricsOverride',{width,height:960,deviceScaleFactor:1,mobile:width<600});await browser.pause(100);
   ok(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'sem transbordamento '+width);
   ok(await browser.evaluate('(()=>{const c=document.querySelector(".admin-order-details-page>.admin-container"),m=document.querySelector(".admin-order-details-main"),s=document.querySelector(".admin-order-details-sidebar");return getComputedStyle(c).display==="block" && (innerWidth<850?s.getBoundingClientRect().top>=m.getBoundingClientRect().bottom-2:s.getBoundingClientRect().left>m.getBoundingClientRect().left);})()'),'colunas organizadas '+width);
   ok(await browser.evaluate('document.querySelector(".admin-order-toolbar button").getBoundingClientRect().height>=44'),'toque adequado '+width);
   if([390,1366].includes(width))await browser.screenshot(new URL('pedido-'+width+'.png',pasta).pathname);
  }

  await browser.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await browser.pause(200);ok(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'layout mobile preservado');
  await browser.click('.admin-logout-button');await login(emailCliente);await browser.wait('Boolean(document.querySelector("#admin-email")) && /não possui acesso administrativo/i.test(document.body.textContent)');ok(!await browser.evaluate('Boolean(document.querySelector(".admin-order-items"))'),'cliente sem painel');
  await browser.navigate(base+'/perfil/pedido?id='+compra.id);await browser.wait('document.querySelector(".order-status-badge")?.getAttribute("data-status")==="entregue"');ok(await browser.evaluate('document.body.textContent.includes("confirmado")'),'cliente acompanha pagamento e andamento');
  await browser.navigate(base+'/admin/pedidos');await login(emailOutraLoja);await browser.wait('Boolean(document.querySelector("#admin-email")) && /não possui acesso administrativo/i.test(document.body.textContent)');ok(!await browser.evaluate('Boolean(document.querySelector(".admin-order-row"))'),'admin outra loja sem painel');
  ok(!requests.some(u=>/127\.0\.0\.1:1\/|\/admin\/lojas\/|onrender\.com/.test(u)),'nenhuma dependencia Express');ok(browser.errors.length===0,'sem excecoes JS');
  const recibo={checks,build:'aprovado',saidas:result.output.length,pedidoPersistidoNoEmulator:true,express:false,distAlterado:false};await writeFile(new URL('../../../docs/ADAPTACAO_SERVERLESS/ADMIN_PEDIDO_BROWSER_EVIDENCIAS.json',import.meta.url),JSON.stringify({...recibo,physicalDevice:false,realFirebaseWrites:0},null,2)+'\n');console.log(JSON.stringify({adminPedidosNavegador:recibo}));return recibo;
 }catch(e){if(browser)console.error(JSON.stringify({checksAprovados:checks,path:await browser.evaluate('location.pathname'),alertas:await browser.evaluate('Array.from(document.querySelectorAll("[role=alert],[role=status]")).map(e=>e.textContent)'),excecoes:browser.errors}));throw e;}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
