// Verificação online da release: somente leitura Firestore e sessão/login necessários.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
assert.equal(process.env.CATALOGOS_VALIDACAO_PAGES_011,'AUTORIZADA','Validação online exige autorização explícita');
const {chrome}=require('./lib/chrome.cjs');
const root=path.resolve(__dirname,'../../..'),receipt=path.join(root,'docs/ADAPTACAO_SERVERLESS/PUBLICACAO_JS_ONLINE_EVIDENCIAS.json');
const state=JSON.parse(fs.readFileSync(path.join(root,'private-backups/homologacao-real-011/rodada.json')));
const base='https://catalogo-demo-cz1.pages.dev';
const out=fs.existsSync(receipt)?JSON.parse(fs.readFileSync(receipt)):{started:new Date().toISOString(),url:base,checks:[],newOrders:0,newRegisteredAccounts:0,necessaryAnonymousSessions:0};
if(out.error){out.previousFailures||=[];out.previousFailures.push(out.error);delete out.error;}
const save=()=>fs.writeFileSync(receipt,JSON.stringify(out,null,2)+'\n');
const check=(id,v,details={})=>{assert.ok(v,id);out.checks=out.checks.filter(x=>x.id!==id);out.checks.push({id,passed:true,at:new Date().toISOString(),...details});save();console.log(JSON.stringify({check:id,passed:true}));};
let browser;
(async()=>{
 browser=await chrome();out.legacyRequest=false;out.firestoreRequest=false;out.firestoreWriteAttempt=false;
 browser.onEvent(m=>{if(m.method==='Network.requestWillBeSent'){const u=m.params.request.url;if(/onrender\.com/.test(u))out.legacyRequest=true;if(/firestore.googleapis.com/.test(u))out.firestoreRequest=true;if(/firestore.googleapis.com.*(:commit|:batchWrite|\/Write\/)/.test(u))out.firestoreWriteAttempt=true;}});
 await browser.send('Network.setBlockedURLs',{urls:['*://*.onrender.com/*','*://wa.me/*','*://api.whatsapp.com/*','*:sendOobCode*','*firestore.googleapis.com/*:commit*','*firestore.googleapis.com/*:batchWrite*','*google.firestore.v1.Firestore/Write/*']});
 const html=await (await fetch(base,{headers:{'Cache-Control':'no-cache'}})).text();out.entryAsset=html.match(/src="([^"\n]+\.js)"/)?.[1]||null;
 await browser.navigate(base+'/');await browser.wait('document.querySelectorAll(".product-card").length>0',60000);check('home-dados-reais',await browser.evaluate('document.body.textContent.includes("Bacon Burger")'));
 await browser.navigate(base+'/cardapio');await browser.wait('document.querySelectorAll(".menu-products .product-card").length===9',60000);check('categorias-produtos',await browser.evaluate('document.body.textContent.includes("Hamb")&&document.body.textContent.includes("Classic Burger")'),{products:9});
 await browser.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});check('mobile-sem-transbordamento',await browser.evaluate('document.documentElement.scrollWidth<=innerWidth+2'));
 await browser.send('Emulation.clearDeviceMetricsOverride');
 if(!out.checks.some(x=>x.id==='anonimo-persiste-reload')){
  assert.ok(!out.anonymousUid,'Não criar outra sessão anônima para repetir resultado incerto');
  await browser.navigate(base+'/perfil');await browser.wait('document.body.textContent.includes("sessão de convidado")',60000);
  // Retornar somente UID/isAnonymous; nunca tokens/credenciais persistidos pelo SDK.
  const who=()=>browser.evaluate(`(async()=>{const names=await indexedDB.databases();const name=names.find(x=>/firebaseLocalStorageDb/.test(x.name))?.name;if(!name)return null;return new Promise((resolve,reject)=>{const req=indexedDB.open(name);req.onerror=()=>reject(Error('IDB'));req.onsuccess=()=>{const db=req.result;const tx=db.transaction('firebaseLocalStorage','readonly');const get=tx.objectStore('firebaseLocalStorage').getAll();get.onsuccess=()=>{const row=get.result.find(x=>x.value?.uid);const v=row?.value;resolve(v?{uid:v.uid,anonymous:v.isAnonymous}:null);db.close();};};});})()`);
  const first=await who();assert.ok(first?.anonymous);out.anonymousUid=first.uid;out.necessaryAnonymousSessions=1;save();
  await browser.send('Page.reload');await browser.wait('document.body.textContent.includes("sessão de convidado")',45000);const second=await who();check('anonimo-persiste-reload',second?.uid===first.uid&&second.anonymous);
 }
 const a=state.accounts.clienteA;
 await browser.navigate(base+'/login');await browser.fill('#email',a.email);await browser.fill('#password',a.password);await browser.click('.login-form button[type=submit]');await browser.wait('location.pathname==="/perfil"&&document.body.textContent.includes("HOMOLOGACAO")',60000);check('login-cliente-existente',true);
 await browser.navigate(base+'/produto?id=classic-burger');await browser.wait('document.querySelector(".add-to-cart-button")?.disabled===false',60000);check('produto-preco-real',await browser.evaluate('document.querySelector(".product-detail-price").textContent.includes("28,90")'));
 await browser.click('.add-to-cart-button');await browser.navigate(base+'/carrinho');await browser.wait('document.querySelectorAll(".cart-item").length===1',45000);await browser.send('Page.reload');await browser.wait('document.querySelectorAll(".cart-item").length===1&&document.querySelector(".cart-item-price")?.textContent.includes("28,90")',60000);check('carrinho-persiste',await browser.evaluate('document.querySelector(".cart-item-price").textContent.includes("28,90")'));
 await browser.navigate(base+'/checkout');await browser.wait('document.querySelector("#endereco-salvo")?.options.length>=2&&document.querySelector(".checkout-summary-total")?.textContent.includes("33,90")',60000);check('checkout-entrega-sem-submit',await browser.evaluate('document.querySelector("button.whatsapp-checkout-button").disabled===false'));
 await browser.click('.delivery-option:last-child');await browser.wait('document.querySelector(".checkout-summary-total").textContent.includes("28,90")');check('checkout-retirada-sem-submit',true);
 await browser.navigate(base+'/perfil/pedidos');for(const p of state.orders)await browser.wait('document.body.textContent.includes('+JSON.stringify(p.id)+')',45000);check('historico-pedidos-existentes',true,{orders:state.orders.length});
 await browser.navigate(base+'/perfil/pedido?id='+state.orders[0].id);await browser.wait('document.body.textContent.includes("entregue")&&document.body.textContent.includes("confirmado")&&document.querySelector(".order-total-row")?.textContent.includes("33,90")',45000);check('detalhe-acompanhamento-existente',true);
 await browser.navigate(base+'/admin/pedidos');await browser.wait('Boolean(document.querySelector("#admin-email"))&&/acesso negado/i.test(document.body.textContent)',45000);check('admin-restrito-cliente',!await browser.evaluate('Boolean(document.querySelector(".admin-order-row"))'));
 check('sem-paginas-provisorias',!await browser.evaluate('/Recurso indisponível nesta demonstração|Aplicação indisponível/.test(document.body.textContent)'));
 check('sdk-firebase-sem-render',out.firestoreRequest&&!out.legacyRequest);check('sem-gravacao-firestore',!out.firestoreWriteAttempt);check('sem-excecao-js',browser.errors.length===0);
 out.status='APROVADO';out.finished=new Date().toISOString();delete out.error;save();console.log(JSON.stringify({status:out.status,checks:out.checks.length,newOrders:0,newRegisteredAccounts:0,necessaryAnonymousSessions:out.necessaryAnonymousSessions}));
})().catch(e=>{out.status='REPROVADO';out.error={at:new Date().toISOString(),message:e.message.replace(/https?:\/\/\S+/g,'[url omitida]').slice(0,400)};save();console.error(JSON.stringify(out.error));process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});
