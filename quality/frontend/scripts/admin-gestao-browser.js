import {auditarLayoutAdmin} from './lib/admin-audit.cjs';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createRequire} from 'node:module';
import {build} from 'vite';
const require=createRequire(import.meta.url),{chrome}=require('./lib/chrome.cjs');
export async function verificarAdminGestaoNavegador({projectId,host,authHost,lojaId,email,emailCliente,emailOutraLoja,conferir,forcarFalha,restaurarRegras,produtoId,pedidoId}){
 assert.match(projectId,/^demo-/);for(const h of [host,authHost])assert.match(h,/^(127\.0\.0\.1|localhost):\d+$/);
 const env={VITE_APP_ENV:'test',VITE_CATALOGOS_RUNTIME_MODE:'full',VITE_LOJA_ID:lojaId,VITE_FIREBASE_PROJECT_ID:projectId,VITE_FIREBASE_API_KEY:'fake-api-key',VITE_FIREBASE_APP_ID:'fake-app',VITE_FIREBASE_AUTH_DOMAIN:'localhost',VITE_FIREBASE_AUTH_EMULATOR_URL:'http://'+authHost,VITE_FIRESTORE_EMULATOR_HOST:host,VITE_API_URL:'http://127.0.0.1:1',MODE:'test',DEV:false,PROD:true,BASE_URL:'/'};
 const result=await build({root:new URL('../../../frontend/',import.meta.url).pathname,envFile:false,define:Object.fromEntries(Object.entries(env).map(([k,v])=>['import.meta.env.'+k,JSON.stringify(v)])),plugins:[{name:'quality-admin013-diagnostico-local',transform(code,id){if(id.endsWith('/lib/firebase.js'))return "import {terminate as encerrarFirestore013} from 'firebase/firestore';\n"+code+'\nglobalThis.__debug013={auth,db,encerrar:()=>encerrarFirestore013(db)};globalThis.__emulatorAntesNavegar=globalThis.__debug013.encerrar;';if(id.endsWith('/services/admin.js'))return code+'\nglobalThis.__debugAdmin013=admin;';}}],build:{write:false},logLevel:'error'});
 const arquivos=new Map(result.output.map(o=>['/'+o.fileName,o.type==='asset'?o.source:o.code]));
 const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname;res.writeHead(200,{'Content-Type':p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html'});res.end(arquivos.get(p) ?? arquivos.get('/index.html'));});
 let browser,checks=0;const requests=[];const ok=(v,m)=>{assert.ok(v,m);checks++;};
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  browser=await chrome({antesDeNavegar:true});browser.onEvent(m=>{if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);if(m.method==='Page.javascriptDialogOpening')browser.send('Page.handleJavaScriptDialog',{accept:true});});await browser.send('Network.setBlockedURLs',{urls:['https://*']});
  async function login(conta){await browser.wait('Boolean(document.querySelector("#admin-email"))');await browser.fill('#admin-email',conta);await browser.fill('#admin-senha','Senha-local-teste-123!');await browser.click('.login-form button[type=submit]');}
  await browser.navigate(base+'/admin');await browser.wait('Boolean(document.querySelector(".google-login"))');checks++;
  await browser.navigate(base+'/login');await browser.fill('#email',email);await browser.fill('#password','Senha-local-teste-123!');await browser.click('.login-submit');
  await browser.wait('location.pathname==="/admin" && Boolean(document.querySelector(".admin-topbar"))');checks++;
  for(const width of [320,390,1366]){
    await browser.send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<600});
    await browser.navigate(base+'/perfil');await browser.wait("Boolean(document.querySelector('.profile-options a[href=\"/admin\"]'))");
    ok(await browser.evaluate('document.body.textContent.includes("CONTA ADMINISTRATIVA")'),'perfil identifica administrador');
    ok(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'perfil admin sem transbordamento '+width);
    if(width<600)await browser.click('.mobile-menu-toggle');
    ok(await browser.evaluate("Boolean([...document.querySelectorAll('header a[href=\"/admin\"]')].find(a=>a.textContent.includes('Painel administrativo')))"),'menu oferece painel '+width);
  }
  await browser.navigate(base+'/admin');await browser.wait('document.querySelectorAll(".admin-stat-card").length>0 || document.body.textContent.includes("Pedidos no período")');checks++;
  await browser.wait('/^[0-9]+$/.test(document.querySelector(".admin-stat-value")?.textContent.trim() || "") && Boolean(document.querySelector(".admin-summary-item"))');ok(await browser.evaluate('document.body.textContent.includes("Pagamentos confirmados")'),'dashboard dados reais');
  await browser.navigate(base+'/admin/clientes');await browser.wait('document.querySelectorAll(".admin-customer-row").length===25');checks++;
  await browser.fill('input[type=search]','Cliente 12');await browser.wait('document.querySelectorAll(".admin-customer-row").length===1');checks++;
  await browser.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent==="Ver cliente").click()');await browser.wait('Boolean(document.querySelector("[role=dialog]"))');ok(await browser.evaluate('document.querySelector("[role=dialog]").textContent.includes("Cliente 12")'),'modal autorizado');
  await browser.navigate(base+'/admin/clientes');await browser.wait('document.querySelectorAll(".admin-customer-row").length===25');await browser.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent==="Próxima página").click()');await browser.wait('document.querySelectorAll(".admin-customer-row").length===3');checks++;
  await browser.navigate(base+'/admin/configuracoes');await browser.wait('document.querySelector("#nome")?.value==="Loja editada008"');checks++;
  const revisaoAntes=(await conferir()).revisao;
  await browser.fill('#nome','Loja navegador008');await browser.fill('#whatsapp','51977776666');await browser.fill('#taxaEntrega','9.75');
  for(const dia of ['segunda','terca','quarta','quinta','sexta','sabado','domingo']){await browser.fill('#abertura-'+dia,'10:00');await browser.fill('#fechamento-'+dia,'20:00');}
  await browser.evaluate('(()=>{const b=Array.from(document.querySelectorAll("button")).find(b=>b.textContent.includes("Salvar configurações"));b.form.requestSubmit();b.form.requestSubmit();})()');await browser.wait('document.body.textContent.includes("salvos em etapas")');checks++;
  const salvo=await conferir();ok(salvo.revisao>revisaoAntes&&salvo.revisao<=revisaoAntes+11,'duplo submit preserva revisão limitada aos dias e grupos alterados');ok(salvo.origem.nome==='Loja navegador008' && salvo.publico.nome==='Loja navegador008' && salvo.publico.whatsapp==='5551977776666' && salvo.publico.entrega.taxa===9.75,'formulario alterou origem/projecao realmente');ok(salvo.origem.privado==='sentinela' && !JSON.stringify(salvo.publico).includes('sentinela'),'formulario preserva privacidade');ok(['segunda','terca','quarta','quinta','sexta','sabado','domingo'].every(d=>salvo.origem.horarios[d].abertura==='10:00' && salvo.publico.horarios[d]==='10:00 às 20:00'),'formulario salva os sete dias em etapas');
  if(forcarFalha){
   await forcarFalha();
   try{
    for(const dia of ['segunda','terca','quarta','quinta','sexta','sabado','domingo'])await browser.fill('#abertura-'+dia,'11:00');
    await browser.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.includes("Salvar configurações")).click()');
    await browser.wait('document.querySelector("[role=alert]")?.textContent.includes("interrompido")');checks++;
    ok(await browser.evaluate('document.querySelector("#abertura-quarta").value==="11:00" && !document.body.textContent.includes("salvos em etapas") && document.querySelector("[role=alert]").textContent.includes("segunda, terca")'),'falha parcial informa dias e preserva formulario sem sucesso falso');
    const parcial=await conferir();ok(parcial.origem.horarios.segunda.abertura==='11:00' && parcial.origem.horarios.terca.abertura==='11:00' && parcial.origem.horarios.quarta.abertura==='10:00' && parcial.publico.horarios.segunda==='11:00 às 20:00' && parcial.publico.horarios.quarta==='10:00 às 20:00','falha real do formulario mantém cada origem/projecao consistente');
   }finally{await restaurarRegras();}
  }
  await browser.fill('#whatsapp','abc');await browser.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.includes("Salvar configurações")).click()');await browser.wait('document.querySelector("[role=alert]")?.textContent.includes("inválido")');ok((await conferir()).publico.whatsapp==='5551977776666','invalido nao persiste');
  await browser.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await browser.pause(200);ok(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),'responsividade preservada');
  const layout=await auditarLayoutAdmin(browser,base,{produtoId,pedidoId});checks+=layout.checks;
  await browser.click('.admin-logout-button');await login(emailCliente);await browser.wait('Boolean(document.querySelector("#admin-email")) && /não possui acesso administrativo/i.test(document.body.textContent)');ok(!await browser.evaluate('Boolean(document.querySelector("#nome"))'),'cliente semconfig');
  await login(emailOutraLoja);await browser.wait('Boolean(document.querySelector("#admin-email")) && /não possui acesso administrativo/i.test(document.body.textContent)');ok(!await browser.evaluate('Boolean(document.querySelector("#nome"))'),'admin outra loja semconfig');
  ok(!requests.some(u=>/127\.0\.0\.1:1\/|\/admin\/lojas\/|onrender\.com/.test(u)),'painel sem Express');ok(browser.errors.length===0,'sem excecoes JS');
  const recibo={checks,layout,build:'aprovado',saidas:result.output.length,express:false,distAlterado:false};console.log(JSON.stringify({adminGestaoNavegador:recibo}));return recibo;
 }catch(e){if(browser)console.error(JSON.stringify({checksAprovados:checks,path:await browser.evaluate('location.pathname'),alertas:await browser.evaluate('Array.from(document.querySelectorAll("[role=alert],[role=status]")).map(e=>e.textContent)'),excecoes:browser.errors,console:browser.consoleErrors.map(x=>x.slice(0,300)),authState:await browser.evaluate('({userPresent:!!globalThis.__debug013?.auth.currentUser,initialized:globalThis.__debug013?.auth._isInitialized,anonymous:globalThis.__debug013?.auth.currentUser?.isAnonymous})'),probe:await browser.evaluate('Promise.race([globalThis.__debugAdmin013.sessao().then(()=>({ok:true}),e=>({ok:false,status:e.status,code:e.code})),new Promise(r=>setTimeout(()=>r({timeout:true}),3000))])'),requests:requests.slice(-6).map(u=>{try{const v=new URL(u);return v.origin+v.pathname;}catch{return "invalid";}})}));throw e;}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
