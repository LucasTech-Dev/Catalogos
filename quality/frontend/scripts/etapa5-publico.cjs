// Somente após publicação autorizada: navegação pública, Auth/escritas bloqueados.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chrome}=require('./lib/chrome.cjs');
assert.equal(process.env.CATALOGOS_ETAPA5_LEITURA_PUBLICA,'AUTORIZADA');
const sha=process.env.CATALOGOS_ETAPA5_PUBLICADO_SHA;assert.match(sha||'',/^[a-f0-9]{40}$/);
const base='https://catalogo-demo-cz1.pages.dev',out={at:new Date().toISOString(),shaConfirmadoNoCloudflare:sha,url:base,checks:[],realAuthAccounts:0,realFirebaseWrites:0,realOrders:0,messagesSent:0,privateAdminFlows:'validados no Emulator; produção somente proteção sem login'},receipt=path.resolve(__dirname,'../../../docs/ADAPTACAO_SERVERLESS/ETAPA5_PUBLICO.json');
assert.ok(!fs.existsSync(receipt),'Preservar recibo anterior.');
let b;const ok=(id,v)=>{assert.ok(v,id);out.checks.push(id);};
(async()=>{
 b=await chrome();await b.send('Network.setBlockedURLs',{urls:['*identitytoolkit*','*securetoken*','*://wa.me/*','*://api.whatsapp.com/*','*firestore.googleapis.com/*:commit*','*firestore.googleapis.com/*:batchWrite*','*google.firestore.v1.Firestore/Write/*']});
 let produto;
 for(const width of [320,390,768,1366]){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height:960,deviceScaleFactor:1,mobile:width<600});
  await b.navigate(base+'/');await b.wait('Boolean(document.querySelector(".home-page, .hero, .hero-section")) || /Lancheria/i.test(document.title)',45000);ok('Home-'+width,await b.evaluate('!document.body.innerText.includes("Cozinha Aurora")&&!document.body.innerText.includes("Cantina Boreal")'));
  await b.navigate(base+'/cardapio');await b.wait('document.querySelectorAll(".menu-products .product-card").length>0',45000);ok('cardapio-'+width,true);ok('largura-'+width,await b.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'));
  await b.wait('Array.from(document.querySelectorAll(".product-image img")).some(i=>i.complete&&i.naturalWidth>0)',45000);ok('imagens-'+width,true);
  produto=await b.evaluate('document.querySelector(".product-card:not(.product-card-unavailable) h3 a")?.getAttribute("href")');
 }
 assert.ok(produto?.startsWith('/produto?id='));await b.navigate(base+produto);await b.wait('Boolean(document.querySelector(".add-to-cart-button:not(:disabled)"))');await b.fill('#observacao-produto','Observação local de verificação');await b.click('.add-to-cart-button');await b.wait('location.pathname==="/carrinho" && Boolean(document.querySelector(".cart-item textarea"))');ok('carrinho-observacao-local',await b.evaluate('document.querySelector(".cart-item textarea").value==="Observação local de verificação"'));
 await b.fill('.cart-item textarea','Observação editada localmente');await b.evaluate('document.querySelector(".cart-item textarea").blur()');await b.navigate(base+'/carrinho');await b.wait('document.querySelector(".cart-item textarea")?.value==="Observação editada localmente"');ok('edicao-observacao-local',true);
 await b.navigate(base+'/checkout');await b.wait('Boolean(document.querySelector("h1, [role=alert], .page-loader-error"))');ok('checkout-sem-submit',true);
 await b.navigate(base+'/login');await b.wait('Boolean(document.querySelector("#email"))');ok('login-formulario',true);
 for(const route of ['/admin','/admin/pedidos','/admin/produtos','/admin/categorias','/admin/clientes','/admin/configuracoes']){await b.navigate(base+route);await b.wait('Boolean(document.querySelector("#admin-email"))');ok('protegido-'+route,!await b.evaluate('Boolean(document.querySelector(".admin-layout"))'));}
 ok('sem-excecoes-JS',b.errors.length===0);out.status='APROVADO';console.log(JSON.stringify({status:out.status,checks:out.checks.length,sha,realWrites:0}));
})().catch(e=>{out.status='FALHOU';out.erro=e.message.slice(0,300);process.exitCode=1;console.error(out.erro);}).finally(async()=>{if(b)await b.close();fs.writeFileSync(receipt,JSON.stringify(out,null,2)+'\n');});
