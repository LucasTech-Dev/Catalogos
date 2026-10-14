const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs/promises');
const path=require('node:path');
const {spawn}=require('node:child_process');
const os=require('node:os');
const {performance}=require('node:perf_hooks');
require('../src/config/ambiente').validarAmbiente();
assert.ok(process.env.GCLOUD_PROJECT?.startsWith('demo-'));
for(const key of ['FIREBASE_AUTH_EMULATOR_HOST','FIRESTORE_EMULATOR_HOST'])assert.match(process.env[key] || '',/^(localhost|127\.0\.0\.1):\d+$/);
process.env.CORS_ORIGINS='http://127.0.0.1:5273,http://127.0.0.1:5274';
const app=require('../src/app');
const firestore=require('firebase-admin/firestore'),db=firestore.getFirestore();
const {getAuth}=require('firebase-admin/auth');
const {identity}=require('./publico-emulator-integration');
const {chrome,pause}=require('../../demo/scripts/lib/chrome.cjs');
const root=path.resolve(__dirname,'../..'),evidencias=path.join(root,'docs/evidencias-etapa24');
let checks=0;const passos=[],medicoes=[];const processos=[];
async function main(){
  const lojaA='etapa24-a',lojaB='etapa24-b',auth=getAuth();
  await fs.writeFile(path.join(root,'demo/.etapa24-image.svg'),'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="#e5e7eb"/></svg>');
  const imagem='http://127.0.0.1:5273/.etapa24-image.svg';
  for(const [id,nome] of [[lojaA,'Restaurante A'],[lojaB,'Restaurante B']]){
    const ref=db.doc('lojas/'+id);await ref.set({nome,ativo:true,whatsapp:'11999999999',pagamentos:{pix:true,dinheiro:true,cartao_credito:true,cartao_debito:true},entrega:{habilitada:true,taxa:7},retirada:{habilitada:true},pedidoMinimo:0,segredo:'sentinela-privada'});
    await ref.collection('categorias').doc('cat').set({nome:'Lanches',ativo:true});await ref.collection('categorias').doc('bebidas').set({nome:'Bebidas',ativo:true});
    for(const [produtoId,preco,categoriaId,ativo] of [['burger',20,'cat',true],['suco',8,'bebidas',true],['oculto',999,'cat',false]])await ref.collection('produtos').doc(produtoId).set({nome:produtoId==='burger'?'Burger real':produtoId==='suco'?'Suco real':'Produto oculto',preco,categoriaId,ativo,disponivel:true,descricao:'Produto do '+nome,ingredientes:['Ingredientes'],imagem,segredo:'sentinela-privada'});
  }
  const email='admin-etapa24@teste.local',senha='Senha-local-123!';
  try{await auth.deleteUser((await auth.getUserByEmail(email)).uid);}catch(e){if(e.code!=='auth/user-not-found')throw e;}
  const admin=await auth.createUser({email,password:senha});await db.doc('usuarios/'+admin.uid).set({role:'admin',lojaId:lojaA,ativo:true});
  const login=await identity('signInWithPassword',{email,password:senha});
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  const api='http://127.0.0.1:'+server.address().port;
  async function request(method,url,token,body,status,chave){const r=await fetch(api+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...(chave?{'Idempotency-Key':chave}:{})},body:body===undefined?undefined:JSON.stringify(body)});const d=r.status===204?null:await r.json();if(status){assert.equal(r.status,status,method+' '+url+' '+JSON.stringify(d));checks++;}return {status:r.status,data:d};}
  for(const [loja,port] of [[lojaA,5273],[lojaB,5274]]){
    const env={...process.env,VITE_LOJA_ID:loja,VITE_API_URL:api,VITE_FIREBASE_PROJECT_ID:process.env.GCLOUD_PROJECT,VITE_FIREBASE_API_KEY:'fake-api-key',VITE_FIREBASE_AUTH_DOMAIN:'localhost',VITE_FIREBASE_APP_ID:'fake-app',VITE_FIREBASE_AUTH_EMULATOR_URL:'http://'+process.env.FIREBASE_AUTH_EMULATOR_HOST};
    const p=spawn(process.execPath,[path.join(root,'demo/node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:path.join(root,'demo'),env,stdio:'ignore'});processos.push(p);
    let ok=false;for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:'+port)).ok){ok=true;break;}}catch{}await pause(100);}assert.ok(ok,'Vite não iniciou.');
  }
  await fs.mkdir(evidencias,{recursive:true});const browser=await chrome();
  try{
    const a='http://127.0.0.1:5273',b='http://127.0.0.1:5274';
    async function check(nome,fn){await fn();passos.push(nome);console.log('Navegador: '+nome);}
    async function texto(v){await browser.wait('document.body.innerText.includes('+JSON.stringify(v)+')');}
    await check('catálogo desktop público e sigilo',async()=>{await browser.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});const inicio=performance.now();await browser.navigate(a+'/cardapio');await texto('Burger real');medicoes.push({nome:'catalogo-browser-desktop',tempoAteProdutoMs:+(performance.now()-inicio).toFixed(2),navigation:await browser.evaluate('performance.getEntriesByType("navigation")[0]?.toJSON()')});assert.ok(!await browser.evaluate('document.body.innerText.includes("Produto oculto")'));assert.ok(!await browser.evaluate('document.body.innerText.includes("sentinela-privada")'));await browser.screenshot(path.join(evidencias,'catalogo-desktop.png'));});
    await check('filtro de categoria',async()=>{await browser.evaluate('[...document.querySelectorAll("button")].find(b=>b.innerText.includes("Bebidas")).click()');await browser.wait('!document.querySelector(".menu-products")?.innerText.includes("Burger real")');await texto('Suco real');});
    await check('URL direta e detalhes do produto',async()=>{await browser.navigate(a+'/produto?id=burger');await texto('Burger real');await browser.click('.add-to-cart-button');});
    await check('carrinho persiste entre páginas, reload e histórico',async()=>{await browser.navigate(a+'/carrinho');await texto('Burger real');await browser.send('Page.reload');await texto('Burger real');await browser.navigate(a+'/cardapio');await browser.evaluate('history.back()');await browser.wait('location.pathname==="/carrinho"');await texto('Burger real');});
    await check('outra loja não carrega carrinho A',async()=>{await browser.navigate(b+'/carrinho');await texto('Seu carrinho está vazio');});
    await check('checkout de entrega anônimo cria somente um pedido por clique duplo',async()=>{await browser.navigate(a+'/checkout');await texto('1x Burger real');await browser.wait('Boolean(document.querySelector("#nome"))');for(const [sel,v] of [['#nome','Cliente navegador'],['#telefone','11999999999'],['#endereco','Rua São José'],['#numero','10'],['#bairro','Centro'],['#cidade','São Paulo'],['#uf','SP']])await browser.fill(sel,v);await browser.evaluate('[...document.querySelectorAll("button")].find(b=>b.innerText.includes("Registrar pedido")).click();[...document.querySelectorAll("button")].find(b=>b.innerText.includes("Registrar pedido")).click()');await browser.wait('Boolean(document.querySelector("a.whatsapp-checkout-button"))');const href=await browser.evaluate('document.querySelector("a.whatsapp-checkout-button").href');assert.match(href,/^https:\/\/wa\.me\/\d+\?text=/);assert.equal((await db.doc('lojas/'+lojaA).collection('pedidos').get()).size,1);await browser.screenshot(path.join(evidencias,'checkout-desktop.png'));});
    await check('mobile e navegação direta/reload',async()=>{await browser.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await browser.navigate(a+'/cardapio');await texto('Burger real');assert.ok(await browser.evaluate('document.documentElement.scrollWidth <= innerWidth+1'));await browser.send('Page.reload');await texto('Burger real');await browser.screenshot(path.join(evidencias,'catalogo-mobile.png'));});
    await check('anônimo impedido de acessar painel',async()=>{await browser.navigate(a+'/admin');await texto('Acesso administrativo');assert.ok(!await browser.evaluate('Boolean(document.querySelector(".admin-dashboard-page"))'));});
    await check('login administrativo e páginas internas',async()=>{await browser.fill('#admin-email',email);await browser.fill('#admin-senha',senha);await browser.evaluate('document.querySelector(".login-form").requestSubmit()');await browser.wait('Boolean(document.querySelector(".admin-layout"))');for(const route of ['/admin/produtos','/admin/categorias','/admin/clientes','/admin/configuracoes','/admin/pedidos']){await browser.navigate(a+route);await browser.wait('Boolean(document.querySelector(".admin-layout"))');await browser.wait('!document.body.innerText.includes("Carregando...")');}await browser.screenshot(path.join(evidencias,'admin-mobile.png'));});
    await check('criação de categoria no painel reflete no catálogo',async()=>{await browser.navigate(a+'/admin/categorias');await browser.wait('Boolean(document.querySelector(".admin-categories-page"))');await browser.evaluate('[...document.querySelectorAll("button")].find(b=>b.innerText.includes("Nova categoria")).click()');await browser.fill('#categoria-nome','Categoria Chrome');await browser.fill('#categoria-descricao','Categoria de homologação');await browser.evaluate('document.querySelector("form").requestSubmit()');await browser.wait('!document.querySelector("#categoria-nome")');await browser.navigate(a+'/cardapio');await texto('Categoria Chrome');});
    await check('cadastro de produto no painel reflete preço público',async()=>{await browser.navigate(a+'/admin/produto/novo');await browser.fill('#nome','Produto Chrome');await browser.fill('#descricao','Produto criado pelo painel');await browser.wait('Boolean(document.querySelector("#categoria option[value=cat]"))');await browser.fill('#categoria','cat');await browser.fill('#preco','14.90');await browser.evaluate('document.querySelector("form").requestSubmit()');await texto('Produto salvo');await browser.navigate(a+'/cardapio');await texto('Produto Chrome');});
    await check('logout administrativo oculta painel e mostra formulário de login',async()=>{await browser.navigate(a+'/admin');await browser.click('.admin-sidebar-exit');await browser.wait('!document.querySelector(".admin-layout") && Boolean(document.querySelector("#admin-email"))');});
    assert.deepEqual(browser.errors,[],'Exceções JavaScript no navegador.');assert.deepEqual(browser.consoleErrors,[],'Erros de console JavaScript no navegador.');
    // Cenários HTTP complementam o fluxo visual, sem abrir wa.me.
    const cliente=await identity('signUp',{}),outro=await identity('signUp',{}),orders='/lojas/'+lojaA+'/pedidos',pub='/publico/lojas/'+lojaA;
    const end=await request('POST',pub+'/me/enderecos',cliente.idToken,{rua:'Rua',numero:'s/n',bairro:'Centro',cidade:'São Paulo',uf:'SP'},201);
    const body={tipoEntrega:'retirada',itens:[{produtoId:'burger',quantidade:1}],pagamento:{forma:'pix'}};
    for(const forma of ['pix','dinheiro','cartao_credito','cartao_debito'])for(const tipoEntrega of ['entrega','retirada']){const r=await request('POST',orders,cliente.idToken,{...body,tipoEntrega,...(tipoEntrega==='entrega'?{enderecoId:end.data.id}:{}),pagamento:{forma}},201,crypto.randomUUID());assert.equal(r.data.total,tipoEntrega==='entrega'?27:20);assert.equal(r.data.pagamento.status,'pendente');}
    for(const [method,tail,data] of [['GET','/clientes'],['PATCH','/loja',{nome:'Invasão'}],['PATCH','/produtos/burger',{preco:1}]])await request(method,'/admin/lojas/'+lojaB+tail,login.idToken,data,403);
    await request('POST',orders,outro.idToken,{...body,tipoEntrega:'entrega',enderecoId:end.data.id},400,crypto.randomUUID());
    await request('GET','/publico/lojas/'+encodeURIComponent(lojaA+'/clientes/'+cliente.localId)+'/catalogo',null,undefined,400);
    // Alteração depois da validação HTTP, imediatamente antes da transação de checkout.
    const produto=db.doc('lojas/'+lojaA+'/produtos/burger'),txOriginal=db.runTransaction;let alterou=false;
    try{db.runTransaction=async function(fn){if(!alterou){alterou=true;await produto.update({preco:33});}return txOriginal.call(this,fn);};const r=await request('POST',orders,cliente.idToken,body,201,crypto.randomUUID());assert.equal(r.data.total,33);}finally{db.runTransaction=txOriginal;}
    const qtdAntes=(await db.doc('lojas/'+lojaA).collection('pedidos').get()).size;alterou=false;
    try{db.runTransaction=async function(fn){if(!alterou){alterou=true;await produto.update({ativo:false});}return txOriginal.call(this,fn);};await request('POST',orders,cliente.idToken,body,400,crypto.randomUUID());}finally{db.runTransaction=txOriginal;await produto.update({preco:20,ativo:true});}
    assert.equal((await db.doc('lojas/'+lojaA).collection('pedidos').get()).size,qtdAntes);
    const contadores={documentos:0,queries:0,agregacoes:0,documentosRetornados:0};
    for(const [nome,campo] of [['DocumentReference','documentos'],['Query','queries'],['AggregateQuery','agregacoes']]) {
      const proto=nome==='AggregateQuery'?Object.getPrototypeOf(db.collection('lojas').count()):firestore[nome]?.prototype;if(!proto || typeof proto.get!=='function')throw Error('SDK sem classe de medição '+nome);
      const original=proto.get;proto.get=async function(...args){contadores[campo]++;const resultado=await original.apply(this,args);if(campo==='documentos' && resultado.exists)contadores.documentosRetornados++;if(campo==='queries')contadores.documentosRetornados+=resultado.size;return resultado;};
    }
    // Benchmark serial, amostra fixa. Contadores são chamadas SDK/resultados, não fatura.
    const ref=db.doc('lojas/'+lojaB);
    for(const volume of [100,1000]){
      for(let start=0;start<volume;start+=200){const batch=db.batch();for(let i=start;i<Math.min(start+200,volume);i++){batch.set(ref.collection('produtos').doc('p'+String(i).padStart(5,'0')),{nome:'Produto volume '+i,preco:10,categoriaId:'cat',ativo:true,disponivel:true});batch.set(ref.collection('pedidos').doc('pedido'+String(i).padStart(5,'0')),{clienteId:'cliente-volume',total:10,status:'recebido',pagamento:{forma:'pix',status:'pendente',valor:10},itens:[],criadoEm:new Date()});}await batch.commit();}
      await db.doc('usuarios/'+admin.uid).update({lojaId:lojaB});
      for(const [nome,url] of [['catalogo','/publico/lojas/'+lojaB+'/catalogo'],['produtos','/admin/lojas/'+lojaB+'/produtos?limite=25'],['pedidos','/lojas/'+lojaB+'/pedidos?limite=25'],['dashboard','/admin/lojas/'+lojaB+'/dashboard']]){
        for(let i=0;i<3;i++)await request('GET',url,nome==='catalogo'?null:login.idToken,undefined,200);
        const tempos=[];let bytes=0,operacoesSDK;
        for(let i=0;i<20;i++){for(const k of Object.keys(contadores))contadores[k]=0;const begin=performance.now(),r=await request('GET',url,nome==='catalogo'?null:login.idToken,undefined,200);tempos.push(performance.now()-begin);bytes=Buffer.byteLength(JSON.stringify(r.data));operacoesSDK={...contadores};}
        tempos.sort((a,b)=>a-b);medicoes.push({volume,nome,amostras:20,medianaMs:+((tempos[9]+tempos[10])/2).toFixed(2),p95Ms:+tempos[18].toFixed(2),bytesResposta:bytes,operacoesSDK,memoria:process.memoryUsage()});
      }
    }
    const resultado={data:new Date().toISOString(),ambiente:{node:process.version,chrome:process.env.CHROME_BIN || '/usr/bin/google-chrome',cpu:os.cpus()[0]?.model,cpus:os.cpus().length,memoriaHost:os.totalmem()},passosBrowser:passos,excecoesBrowser:browser.errors,consoleErrors:browser.consoleErrors,verificacoesHTTP:checks,medicoes,limites:'Benchmark serial em Emulator, sem estimar capacidade concorrente nem cobrança real; memória inclui harness/SDK no processo do backend.'};
    await fs.writeFile(path.join(evidencias,'resultados.json'),JSON.stringify(resultado,null,2)+'\n');console.log('Etapa24: '+passos.length+' fluxos navegador; '+checks+' verificações HTTP; benchmark concluído.');
  }catch(error){await browser.screenshot(path.join(evidencias,'falha-harness.png'));console.error('Erros JS:',JSON.stringify(browser.errors));console.error('Erros console:',JSON.stringify(browser.consoleErrors));console.error('Alerta de UI:',await browser.evaluate('document.querySelector("[role=alert]")?.innerText || "sem alerta"'));throw error;}finally{await browser.close();for(const p of processos)p.kill('SIGTERM');await new Promise(resolve=>server.close(resolve));await db.terminate();await fs.rm(path.join(root,'demo/.etapa24-image.svg'),{force:true});}
}
main().catch(e=>{for(const p of processos)p.kill('SIGTERM');console.error('Falha homologação24:',e.message);process.exit(1);});
