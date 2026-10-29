import assert from 'node:assert/strict';
import http from 'node:http';
import {build} from 'vite';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chrome}=require('./lib/chrome.cjs');
export async function homologarNavegador(c){
 const resultados=[];
 for(const [L,outra,nome,cor,email,senha,admin,comprar,gest,cat] of [[c.ma.lojaId,c.mb.lojaId,c.ma.loja.nome,'#125b45','cliente-a@example.invalid','Senha-sintetica-nova!',c.adminA,c.comprarA,c.gestA,c.catA],[c.mb.lojaId,c.ma.lojaId,c.mb.loja.nome,'#f5d34e','cliente-b@example.invalid','Senha-sintetica-reset!',c.adminB,c.comprarB,c.gestB,c.catB]]){
 const checks=[];const ok=(v,m)=>{assert.ok(v,m);checks.push(m);};
 const env={VITE_APP_ENV:'test',VITE_CATALOGOS_RUNTIME_MODE:'full',VITE_LOJA_ID:L,VITE_FIREBASE_PROJECT_ID:'demo-replicacao',VITE_FIREBASE_API_KEY:'fake-api-key',VITE_FIREBASE_APP_ID:'fake-app',VITE_FIREBASE_AUTH_DOMAIN:'localhost',VITE_FIREBASE_AUTH_EMULATOR_URL:'http://127.0.0.1:9198',VITE_FIRESTORE_EMULATOR_HOST:'127.0.0.1:8188',VITE_IDENTIDADES_LOJAS:JSON.stringify({[L]:{nome,corPrimaria:cor,logo:'/marca.svg',imagem:'/marca.svg'}}),VITE_CATEGORIAS_DESATIVACAO:'true',MODE:'test',DEV:false,PROD:true,BASE_URL:'/'};
 const result=await build({root:new URL('../../../frontend/',import.meta.url).pathname,envFile:false,define:Object.fromEntries(Object.entries(env).map(([k,v])=>['import.meta.env.'+k,JSON.stringify(v)])),plugins:[{name:'homologacao-local-instrumentacao',transform(code,id){if(id.endsWith('/lib/firebase.js'))return "import {terminate as encerrarE4} from 'firebase/firestore';import {signOut as sairE4,signInWithCredential as entrarE4,GoogleAuthProvider as GoogleE4} from 'firebase/auth';\n"+code+'\nglobalThis.__e4={auth,sair:()=>sairE4(auth),google:token=>entrarE4(auth,GoogleE4.credential(token))};globalThis.__emulatorAntesNavegar=()=>encerrarE4(db);';}}],build:{write:false},logLevel:'error'});
 const files=new Map(result.output.map(o=>['/'+o.fileName,o.type==='asset'?o.source:o.code]));
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="'+cor+'"/></svg>';
 const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname;res.writeHead(200,{'Content-Type':p.endsWith('.svg')?'image/svg+xml':p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html'});res.end(p==='/marca.svg'?svg:files.get(p)||files.get('/index.html'));});
 let browser;
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  browser=await chrome({antesDeNavegar:true});await browser.send('Network.setBlockedURLs',{urls:['https://*']});
  await browser.navigate(base+'/');await browser.wait('document.title.includes('+JSON.stringify(nome)+')');ok(await browser.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()==='+JSON.stringify(cor)),'Home usa cor própria');await browser.wait('Array.from(document.images).some(i=>i.src.endsWith("/marca.svg")&&i.complete&&i.naturalWidth>0)');ok(true,'logo/capa local carregada');
  await browser.navigate(base+'/cardapio');await browser.wait('document.querySelectorAll(".product-card").length>0');ok(!(await browser.evaluate('document.body.innerText')).includes('Produto '+outra),'cardápio sem produto da outra loja');
  await browser.navigate(base+'/login');await browser.fill('#email',email);await browser.fill('#password',senha);await browser.click('.login-submit');await browser.wait('globalThis.__e4?.auth.currentUser?.email==='+JSON.stringify(email));await browser.wait('location.pathname==="/perfil"');ok(true,'login real e-mail no Emulator');
  await browser.navigate(base+'/produto?id=produto-igual');await browser.wait('Boolean(document.querySelector(".add-to-cart-button:not(:disabled)"))');await browser.fill('#observacao-produto','Observação da loja '+L);await browser.click('.add-to-cart-button');await browser.wait('location.pathname==="/carrinho" && Array.from(document.querySelectorAll("textarea,input")).some(e=>e.value==='+JSON.stringify('Observação da loja '+L)+')');ok(true,'produto/observação/carrinho persistidos');
  await browser.navigate(base+'/checkout');await browser.wait('Boolean(document.querySelector(".whatsapp-checkout-button:not(:disabled)"))');await browser.fill('#nome','Cliente navegador '+L);await browser.fill('#telefone','51999990001');
  await browser.evaluate('Array.from(document.querySelectorAll(".delivery-option")).find(b=>b.textContent.includes("Retirada"))?.click()');
  await browser.evaluate('Array.from(document.querySelectorAll(".payment-option")).find(b=>b.textContent.includes("Dinheiro")).click()');
  const antes=await comprar.listarPedidos();await browser.click('.whatsapp-checkout-button');
  await browser.wait('Boolean(document.querySelector("a.whatsapp-checkout-button"))',40000);
  const depois=await comprar.listarPedidos(),novo=depois.find(p=>!antes.some(a=>a.id===p.id));ok(!!novo&&novo.pagamento.status==='pendente'&&novo.lojaId===L,'checkout grava pedido da loja com pagamento pendente');
  const wa=await browser.evaluate('Array.from(document.querySelectorAll("a.whatsapp-checkout-button")).map(a=>a.href)');ok(wa.some(u=>new URL(u).pathname==='/'+(L===c.ma.lojaId?'5551999990001':c.mb.loja.whatsapp)&&new URL(u).searchParams.get('text').includes(nome)),'WhatsApp correto sem abrir/enviar mensagem');
  await browser.navigate(base+'/perfil/pedidos');await browser.wait('document.body.innerText.includes('+JSON.stringify(String(novo.numeroPedido))+')');ok(true,'cliente visualiza histórico após compra');
  // Login Google sintético no mesmo Auth Emulator, sem popup externo ou token real.
  const now=Math.floor(Date.now()/1000),token=Buffer.from(JSON.stringify({alg:'none',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:admin.label,email:admin.label+'@example.invalid',email_verified:true,name:'Identidade sintética',iss:'https://accounts.google.com',aud:'demo-replicacao',iat:now,exp:now+3600})).toString('base64url')+'.';
  await browser.evaluate('globalThis.__e4.sair()');await browser.evaluate('globalThis.__e4.google('+JSON.stringify(token)+').then(()=>true)');
  for(const [rota,seletor] of [['/admin','.admin-stat-value'],['/admin/pedidos','.admin-order-row'],['/admin/produtos','.admin-product-row'],['/admin/categorias','.admin-page-header'],['/admin/clientes','.admin-customer-row'],['/admin/configuracoes','#nome']]){
   await browser.navigate(base+rota);await browser.wait('Boolean(document.querySelector('+JSON.stringify(seletor)+'))');ok(true,'admin autorizado '+rota);
  }
  const descricao='Configuração navegador '+L;await browser.fill('#descricao',descricao);await browser.evaluate('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.includes("Salvar configurações")).click()');await browser.wait('document.body.innerText.includes("salvos") || document.body.innerText.includes("salva")');ok((await gest.loja()).descricao===descricao,'configuração do painel persistiu no Emulator');
  ok(browser.errors.length===0,'zero exceções JavaScript');resultados.push({loja:L,checks,numeroPedido:novo.numeroPedido});
 }catch(e){console.error(JSON.stringify({loja:L,checks:checks.length,path:browser?await browser.evaluate('location.pathname'):null,alertas:browser?await browser.evaluate('Array.from(document.querySelectorAll("[role=alert]")).map(e=>e.textContent)'):[],erro:e.message}));throw e;}
 finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
 }
 return {mesmosFontesReact:true,servicosMockados:false,resultados,totalChecks:resultados.reduce((n,r)=>n+r.checks.length,0)};
}
