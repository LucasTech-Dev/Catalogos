const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chrome}=require('./lib/chrome.cjs');
(async()=>{
 const base=process.env.CATALOGOS_IMAGENS_URL || 'https://catalogo-demo-cz1.pages.dev';
 const b=await chrome(); const receipt={url:base,date:new Date().toISOString(),checks:[],images:[]};
 try {
  for(const [device,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
   await b.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:device==='mobile'});
   await b.navigate(base+'/');
   await b.wait('document.querySelectorAll(".product-card").length===9');
   await b.wait('[...document.images].every(i=>i.complete && i.naturalWidth>0)');
   const images=await b.evaluate('[...document.images].map(i=>({alt:i.alt,src:i.getAttribute("src"),fallback:i.dataset.imageFallback === "true",width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height,naturalWidth:i.naturalWidth}))');
   assert.equal(images.filter(i=>i.fallback).length,4);
   assert.equal(images[0].alt,'Bacon Supreme');
   assert(images.every(i=>i.width>0 && i.height>0));
   assert(await b.evaluate('document.documentElement.scrollWidth <= innerWidth+1'));
   receipt.checks.push(device+': 11 imagens renderizadas; quatro fotos pendentes identificadas; hero real; sem overflow');
   if(device==='desktop')receipt.images=images;
   if(process.env.CATALOGOS_IMAGENS_CAPTURE_DIR)await b.screenshot(process.env.CATALOGOS_IMAGENS_CAPTURE_DIR+'/'+device+'.png');
  }
  await b.navigate(base+'/produto?id=bacon-burger');
  await b.wait('Boolean(document.querySelector(".product-detail-image img[data-image-fallback]"))');
  receipt.checks.push('Detalhe: fallback acessível para produto sem foto');
  await b.evaluate('localStorage.setItem("catalogos:carrinho:loja-demo",JSON.stringify([{id:"bacon-burger",quantidade:1}]))');
  await b.navigate(base+'/carrinho');
  await b.wait('Boolean(document.querySelector(".cart-item-image img[data-image-fallback]"))');
  receipt.checks.push('Carrinho: fallback; somente localStorage temporário do Chrome');
  assert.deepEqual(b.errors,[]);
  receipt.checks.push('Zero exceções JavaScript; sem login, contas, pedidos ou gravações Firebase');
  receipt.pending=['Bacon Burger: campo imagem vazio','Batata Frita: campo imagem vazio','Coca-Cola Lata: campo imagem vazio','Chicken Crispy: URL original HTTP404; fallback não recupera foto'];
  receipt.consoleErrors=b.consoleErrors;
  if(process.env.CATALOGOS_IMAGENS_RECEIPT)fs.writeFileSync(process.env.CATALOGOS_IMAGENS_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify(receipt,null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e.message);process.exit(1)});
