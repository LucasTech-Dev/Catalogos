const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
// Somente o navegador local já autenticado contra Emulators. Nunca aceitar host remoto.
async function auditarLayoutAdmin(browser,base,{produtoId,pedidoId}){
 assert.match(base,/^http:\/\/127\.0\.0\.1:\d+$/);
 const widths=[320,360,390,768,980,981,1366,1920],routes=[['/admin','.admin-dashboard'],['/admin/pedidos','.admin-order-row'],['/admin/pedido?id='+pedidoId,'.admin-order-details-header'],['/admin/produtos','.admin-product-row'],['/admin/produto/novo','#nome'],['/admin/produto?id='+produtoId,'#nome'],['/admin/categorias','.admin-category-row'],['/admin/clientes','.admin-customer-row'],['/admin/configuracoes','#nome']];
 let checks=0;const controls=[];const ok=(v,msg)=>{assert.ok(v,msg);checks++;};
 const dir=path.resolve(__dirname,'../../../../docs/ADAPTACAO_SERVERLESS/EVIDENCIAS_ORDEM_013');await fs.mkdir(dir,{recursive:true});
 for(const [route,ready] of routes){
  await browser.evaluate('globalThis.__debug013?.encerrar?.()');
  await browser.navigate(base+route);await browser.wait('Boolean(document.querySelector('+JSON.stringify(ready)+')) && !document.querySelector(".page-loader")');
  const dom=await browser.evaluate(`(()=>{const groups=new Map();for(const el of document.querySelectorAll('button,a,input,select,textarea,form')){const item={element:el.tagName.toLowerCase(),type:el.getAttribute('type'),id:el.id||null,label:(el.getAttribute('aria-label')||el.labels?.[0]?.textContent||(['BUTTON','A'].includes(el.tagName)?el.textContent:'')||el.getAttribute('placeholder')||'').trim().replace(/\\s+/g,' ').slice(0,160),busy:el.hasAttribute('aria-busy'),disabled:el.matches(':disabled')};const key=JSON.stringify(item);const old=groups.get(key);if(old)old.count++;else groups.set(key,{...item,count:1});}return [...groups.values()];})()`);controls.push({route:route.split('?')[0],mode:route.includes('?')?'existing':'default',elements:dom});
  for(const width of widths){
   await browser.send('Emulation.setDeviceMetricsOverride',{width,height:960,deviceScaleFactor:1,mobile:width<600});await browser.pause(80);
   ok(await browser.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'),route+' sem transbordamento '+width);
   const frame=await browser.evaluate('(()=>{const t=document.querySelector(".admin-topbar").getBoundingClientRect();const s=document.querySelector(".admin-sidebar").getBoundingClientRect();return {left:t.left,right:t.right,bottom:t.bottom,sideTop:s.top,innerWidth,viewportWidth:document.documentElement.clientWidth,sideStyle:getComputedStyle(document.querySelector(".admin-sidebar")).top};})()');
   const alinhado=Math.abs(frame.left)<2&&Math.abs(frame.right-frame.viewportWidth)<2&&frame.sideTop>=frame.bottom-1;
   if(!alinhado)await browser.screenshot(path.join(dir,'falha-layout.png'));
   ok(alinhado,route+' nav/sidebar '+width+' '+JSON.stringify(frame));
   if(width===390&&['/admin','/admin/categorias'].includes(route))await browser.screenshot(path.join(dir,route==='/admin'?'dashboard-390.png':'categorias-390.png'));
   if(width===1366&&route==='/admin/configuracoes')await browser.screenshot(path.join(dir,'configuracoes-1366.png'));
  }
 }
 await browser.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await browser.click('.admin-menu-button');ok(await browser.evaluate('document.querySelector(".admin-menu-button").getAttribute("aria-expanded")==="true"'),'menu mobile abre');await browser.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});ok(await browser.evaluate('document.querySelector(".admin-menu-button").getAttribute("aria-expanded")==="false"'),'Escape fecha menu');
 await browser.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});ok(await browser.evaluate('getComputedStyle(document.querySelector(".admin-sidebar")).transitionDuration==="0s"'),'movimento reduzido');
 await browser.send('Emulation.setEmulatedMedia',{features:[]});
 return {checks,controls,routes:routes.map(r=>r[0].split('?')[0]),widths,realDeviceTested:false,personalLoginAutomated:false};
}
module.exports={auditarLayoutAdmin};
