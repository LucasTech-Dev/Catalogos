// Medição reproduzível online, sem criar contas/pedidos ou gravar no Firestore.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const {chrome}=require('./lib/chrome.cjs');
assert.equal(process.env.CATALOGOS_PERFORMANCE_PAGES,'AUTORIZADA');
const fase=process.argv[2];assert(['antes','depois'].includes(fase));
const root=path.resolve(__dirname,'../../..'),base='https://catalogo-demo-cz1.pages.dev';
const state=JSON.parse(fs.readFileSync(path.join(root,'private-backups/homologacao-real-011/rodada.json')));
const destino=path.join(root,`docs/ADAPTACAO_SERVERLESS/PERFORMANCE_PAGES_${fase.toUpperCase()}.json`);
assert(!fs.existsSync(destino),'Preservar recibo existente; não sobrescrever medições');
const out={fase,started:new Date().toISOString(),url:base,method:'Chrome headless desktop1440x1000; HTTP cache desativado; rede/CPU sem throttling; mesma conta cliente de teste existente; 3 navegações por tela; pronto=DOM com dados; latência inclui HTML/JS/Auth/Firestore; não é tempo isolado de GET',samples:[],checks:[],writesAttempted:0,newAccounts:0,newOrders:0,adminLimit:'Sem sessão administrativa ativa disponível: mede bloqueio a cliente, não consultas internas do painel.'};
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const save=()=>fs.writeFileSync(destino,JSON.stringify(out,null,2)+'\n');
let b;
(async()=>{
 b=await chrome();let legacy=false,firestore=false;
 b.onEvent(m=>{if(m.method==='Network.requestWillBeSent'){const r=m.params.request;if(/onrender\.com/.test(r.url))legacy=true;if(/firestore.googleapis.com/.test(r.url))firestore=true;if(/firestore.googleapis.com.*(:commit|:batchWrite|\/Write\/)/.test(r.url))out.writesAttempted++;}});
 await b.send('Network.setBlockedURLs',{urls:['*://*.onrender.com/*','*://wa.me/*','*://api.whatsapp.com/*','*:signUp*','*:sendOobCode*','*:update*','*:delete*','*firestore.googleapis.com/*:commit*','*firestore.googleapis.com/*:batchWrite*','*google.firestore.v1.Firestore/Write/*']});
 await b.send('Network.setCacheDisabled',{cacheDisabled:true});
 await b.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 const html=await(await fetch(base,{headers:{'Cache-Control':'no-cache'}})).text();out.entryAsset=html.match(/src="([^"\n]+\.js)"/)?.[1];
 const conta=state.accounts.clienteA;
 await b.navigate(base+'/login');await b.fill('#email',conta.email);await b.fill('#password',conta.password);await b.click('.login-form button[type=submit]');
 await b.wait('location.pathname==="/perfil"&&document.body.textContent.includes("HOMOLOGACAO")',60000);
 out.checks.push('Login em conta cliente de homologação existente; sem cadastro novo');
 const tests=[
  ['home','/','document.querySelectorAll(".product-card").length===9'],
  ['catalogo','/cardapio','document.querySelectorAll(".menu-products .product-card").length===9'],
  ['produto','/produto?id=classic-burger','document.querySelector(".add-to-cart-button")?.disabled===false&&document.querySelector(".product-detail-price")?.textContent.includes("28,90")'],
  ['pedidos-cliente','/perfil/pedidos','document.querySelectorAll(".order-card").length>=2&&!document.body.textContent.includes("Carregando pedidos...")'],
  ['painel-bloqueio-cliente','/admin','Boolean(document.querySelector("#admin-email"))&&/acesso negado/i.test(document.body.textContent)'],
  ['produtos-admin-bloqueio-cliente','/admin/produtos','Boolean(document.querySelector("#admin-email"))&&/acesso negado/i.test(document.body.textContent)'],
  ['pedidos-admin-bloqueio-cliente','/admin/pedidos','Boolean(document.querySelector("#admin-email"))&&/acesso negado/i.test(document.body.textContent)']
 ];
 for(let rodada=1;rodada<=3;rodada++)for(const [tela,rota,pronto] of tests){
  const {identifier}=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{window.__medicao={};const checar=()=>{if(!window.__medicao.pronto&&(${pronto}))window.__medicao.pronto=performance.now();};new MutationObserver(checar).observe(document,{childList:true,subtree:true,attributes:true});addEventListener('DOMContentLoaded',checar);})()`});
  await b.navigate(base+rota);await b.wait('Boolean(window.__medicao?.pronto)',60000);
  const metricas=await b.evaluate('(()=>{const n=performance.getEntriesByType("navigation")[0];return {dadosProntosMs:Math.round(window.__medicao.pronto),ttfbMs:Math.round(n.responseStart-n.requestStart),documentoMs:Math.round(n.responseEnd),fcpMs:Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime||0)};})()');
  const row={tela,rodada,...metricas};out.samples.push(row);save();console.log(JSON.stringify(row));
  if(tela==='catalogo'){
   const produtos=await b.evaluate('[...document.querySelectorAll(".menu-products .product-card")].map(e=>({nome:e.querySelector("h3")?.textContent,preco:e.querySelector(".product-card-price")?.textContent||e.querySelector(".product-price")?.textContent||e.textContent.match(/R\\$\\s*[\\d.,]+/)?.[0]})).sort((a,b)=>a.nome.localeCompare(b.nome))');
   assert(produtos.every(p=>p.nome&&p.preco));out.catalogoHash=hash(produtos);out.produtos=produtos;
  }
  if(tela==='pedidos-cliente'){
   const dados=await b.evaluate('[...document.querySelectorAll(".order-card")].map(e=>e.textContent.replace(/\\s+/g," ").trim()).sort()');
   out.pedidosHash=hash(dados);out.pedidosCount=dados.length;
   for(const p of state.orders)assert(await b.evaluate('document.body.textContent.includes('+JSON.stringify(p.id)+')'));
  }
  if(tela.includes('bloqueio'))assert(!await b.evaluate('Boolean(document.querySelector(".admin-dashboard,.admin-product-row,.admin-order-row"))'));
  await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
 }
 out.checks.push('Nove produtos/preços renderizados; Classic Burger28,90; dois pedidos existentes íntegros; painel/produtos/pedidos administrativos negados a cliente');
 await b.navigate(base+'/perfil/pedido?id='+state.orders[0].id);
 await b.wait('document.querySelector(".order-total-row")?.textContent.includes("33,90")',45000);
 out.checks.push('Detalhe de pedido de entrega33,90 preservado');
 const outra=state.accounts.clienteB;
 await b.navigate(base+'/login');await b.fill('#email',outra.email);await b.fill('#password',outra.password);await b.click('.login-form button[type=submit]');await b.wait('location.pathname==="/perfil"&&document.body.textContent.includes("HOMOLOGACAO")',60000);
 await b.navigate(base+'/perfil/pedido?id='+state.orders[0].id);await b.wait('/acesso negado/i.test(document.body.textContent)',45000);
 assert(!await b.evaluate('Boolean(document.querySelector(".order-total-row"))'));out.checks.push('ClienteB não acessa pedido de ClienteA; sem dados do titular expostos');
 assert.equal(out.writesAttempted,0);assert(!legacy);assert(firestore);assert.equal(b.errors.length,0);
 out.checks.push('Zero tentativas de escrita Firestore; zero exceções JS; sem Render');
 const median=xs=>xs.sort((a,b)=>a-b)[Math.floor(xs.length/2)];
 out.summary=tests.map(([tela])=>({tela,medianaMs:median(out.samples.filter(s=>s.tela===tela).map(s=>s.dadosProntosMs)),amostras:3}));
 if(fase==='depois'){
  const antes=JSON.parse(fs.readFileSync(path.join(root,'docs/ADAPTACAO_SERVERLESS/PERFORMANCE_PAGES_ANTES.json')));
  assert.equal(out.catalogoHash,antes.catalogoHash);assert.equal(out.pedidosHash,antes.pedidosHash);
  out.checks.push('Hashes de produtos/preços e pedidos iguais antes/depois');
  out.comparison=out.summary.map(s=>{const ant=antes.summary.find(a=>a.tela===s.tela);return {tela:s.tela,antesMs:ant.medianaMs,depoisMs:s.medianaMs,variacaoPercentual:Math.round((s.medianaMs-ant.medianaMs)/ant.medianaMs*1000)/10};});
 }
 out.status='APROVADO';out.finished=new Date().toISOString();save();console.log(JSON.stringify({status:out.status,summary:out.summary,comparison:out.comparison}));
})().catch(e=>{out.status='FALHA';out.error=e.message.replace(/https?:\/\/\S+/g,'[url]').slice(0,300);save();console.error(JSON.stringify({status:out.status,error:out.error}));process.exitCode=1;}).finally(async()=>{if(b)await b.close();});
