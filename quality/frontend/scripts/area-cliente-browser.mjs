// Ensaio visual local: páginas reais, fixtures sintéticas somente em build de memória.
// Não substitui autorização/Rules: essas camadas permanecem inalteradas e têm regressões próprias.
import {build} from 'vite';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chrome}=require('./lib/chrome.cjs');
const root=path.resolve(import.meta.dirname,'../../..');
const outDir=path.join(root,'private-backups/area-cliente-browser');await fs.mkdir(outDir,{recursive:true});
const fixture=[
 {id:'DEMO-2026-001-IDENTIFICADOR-LONGO-123456789',status:'em_preparacao',tipoEntrega:'entrega',criadoEm:{_seconds:1792929600},itens:[{nome:'Hambúrguer artesanal da casa',quantidade:2,subtotal:57.8}],subtotal:57.8,taxaEntrega:5,total:62.8,pagamento:{forma:'pix',status:'pendente'},endereco:{rua:'Rua de exemplo',numero:'10',bairro:'Centro',cidade:'Cidade demonstrativa'}},
 {id:'DEMO-002',status:'entregue',tipoEntrega:'retirada',criadoEm:{_seconds:1792843200},itens:[{nome:'Batata frita',quantidade:1,subtotal:18}],subtotal:18,taxaEntrega:0,total:18,pagamento:{forma:'dinheiro',status:'confirmado'}}
];
const main=`import React from 'react';import {createRoot} from 'react-dom/client';import './styles.css';import Pedidos from './pages/Pedidos';import Perfil from './pages/Perfil';import Dados from './pages/DadosPessoais';import Enderecos from './pages/Enderecos';import Detalhe from './pages/PedidoDetalhes';import Header from './components/layout/Header';import {ToastProvider} from './components/ui/ToastProvider';const rotas={'/perfil':Perfil,'/perfil/dados':Dados,'/perfil/enderecos':Enderecos,'/perfil/pedido':Detalhe};const Page=rotas[location.pathname]||Pedidos;createRoot(document.getElementById('root')).render(<ToastProvider><Header/><Page/></ToastProvider>);`;
const perfil={nome:'Cliente de demonstração',email:'cliente@example.invalid',telefone:'11999990000',senhaDisponivel:true};
const transform={name:'quality-area-cliente-fixtures-memory-only',enforce:'pre',transform(code,id){
 if(id.endsWith('/src/main.jsx'))return main;
 if(id.endsWith('/lib/firebase.js'))return 'export const auth=null,db=null;export const sessao=async()=>({uid:"visual-demo"});';
 if(id.endsWith('/services/api.js'))return 'export const api=async()=>{throw Error("HTTP bloqueado no ensaio visual.");};';
 if(id.endsWith('/hooks/useSessao.js'))return 'export const useSessao=()=>({usuario:{uid:"visual-demo"},carregando:false});';
 if(id.endsWith('/contexts/LojaContext.jsx'))return 'export const useLoja=()=>({loja:{nome:"Catálogo Demo"},itens:[]});';
 if(id.endsWith('/services/conta.js'))return `export const buscarPerfil=async()=>(${JSON.stringify(perfil)});export const listarEnderecos=async()=>new URLSearchParams(location.search).has('vazio')?[]:[{id:'casa',apelido:'Minha casa',rua:'Rua de exemplo',numero:'10',bairro:'Centro',cidade:'Cidade demonstrativa'}];const bloqueado=async()=>{throw Error('Escrita não permitida no ensaio visual.');};export const salvarPerfil=bloqueado,trocarSenha=bloqueado,sair=bloqueado,salvarEndereco=bloqueado,excluirEndereco=bloqueado;`;
 if(id.endsWith('/services/pedidosConta.js'))return `const pedidos=${JSON.stringify(fixture)};globalThis.__qualityLeituras=0;export async function listarPedidos(){globalThis.__qualityLeituras++;if(globalThis.__qualityFalhar)throw Error('Falha de conexão no ensaio local.');if(globalThis.__qualityPausar)await new Promise(r=>globalThis.__qualityLiberar=r);if(new URLSearchParams(location.search).has('vazio'))return [];return pedidos;}export const buscarPedido=async()=>pedidos[0];`;
}};
const result=await build({root:path.join(root,'frontend'),envFile:false,plugins:[transform],build:{write:false},logLevel:'error'});
const files=new Map(result.output.map(f=>['/'+f.fileName,f.type==='asset'?f.source:f.code]));
const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname;res.writeHead(200,{'Content-Type':p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html'});res.end(files.get(p)||files.get('/index.html'));});
const receipt={layouts:[],environment:'Chrome local; páginas reais com fixtures sintéticas em memória, rede externa bloqueada; sem Firebase real',checks:[],screenshots:[],buildFiles:files.size};let browser;
const check=(id,value)=>{assert.ok(value,id);receipt.checks.push({id,passed:true});};
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chrome();await browser.send('Network.setBlockedURLs',{urls:['https://*']});await browser.send('Emulation.setTimezoneOverride',{timezoneId:'America/Sao_Paulo'});
 async function viewport(width){await browser.send('Emulation.setDeviceMetricsOverride',{width,height:960,deviceScaleFactor:1,mobile:width<600});}
 async function pagina(route){await browser.navigate(base+route);await browser.wait('Boolean(document.querySelector(".customer-container"))&&!document.querySelector(".page-loader")');}
 async function alinhamento(id){const v=await browser.evaluate('(()=>{const r=document.querySelector(".customer-container").getBoundingClientRect();return {left:r.left,right:document.documentElement.clientWidth-r.right,width:r.width,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1};})()');receipt.layouts.push({id,...v});if(v.overflow||Math.abs(v.left-v.right)>=2)await browser.screenshot(path.join(outDir,'diagnostico-layout.png'));check(id+'-centrado-sem-overflow',Math.abs(v.left-v.right)<2&&v.width<=961&&!v.overflow);}
 await viewport(1440);await pagina('/perfil/pedidos');await alinhamento('pedidos-desktop');check('lista-com-dois-pedidos',await browser.evaluate('document.querySelectorAll(".order-card").length===2'));
 check('fundos-cards-separados',await browser.evaluate('getComputedStyle(document.querySelector(".orders-page")).backgroundColor!==getComputedStyle(document.querySelector(".order-card")).backgroundColor'));
 check('botao-estilizado',await browser.evaluate('getComputedStyle(document.querySelector(".orders-refresh")).borderRadius==="11px"&&!!document.querySelector(".orders-refresh svg")'));
 await browser.screenshot(path.join(outDir,'pedidos-desktop.png'));receipt.screenshots.push('pedidos-desktop.png');
 for(const [term,label] of [['demo-002','numero'],['HAMBURGUER','produto-acento'],['preparação','status'],['25/10/2026','data']]){await browser.fill('#busca-pedidos',term);check('busca-'+label,await browser.evaluate('document.querySelectorAll(".order-card").length===1'));}
 await browser.fill('#busca-pedidos','sem-resultado');check('estado-busca-vazia',await browser.evaluate('document.body.textContent.includes("Nenhum pedido encontrado")&&!document.body.textContent.includes("Você ainda não fez nenhum pedido")'));
 await browser.click('.orders-empty button');check('limpar-busca',await browser.evaluate('document.querySelectorAll(".order-card").length===2&&document.querySelector("#busca-pedidos").value===""'));
 await browser.fill('#status-pedidos','entregue');check('filtro-status',await browser.evaluate('document.querySelectorAll(".order-card").length===1'));await browser.fill('#status-pedidos','');
 check('pesquisa-sem-consultas-ou-toast',await browser.evaluate('globalThis.__qualityLeituras===1&&!document.querySelector(".toast-card")'));
 check('link-detalhe-existente',await browser.evaluate('document.querySelector(".order-details-link").getAttribute("href").startsWith("/perfil/pedido?id=")'));
 await browser.evaluate('globalThis.__qualityPausar=true');await browser.click('.orders-refresh');check('loading-botao',await browser.evaluate('document.querySelector(".orders-refresh").disabled&&document.querySelector(".orders-refresh").getAttribute("aria-busy")==="true"&&!document.querySelector(".toast-sucesso")'));
 await browser.evaluate('globalThis.__qualityPausar=false;globalThis.__qualityLiberar()');await browser.wait('Boolean(document.querySelector(".toast-sucesso"))');check('atualizacao-confirmada',true);
 await browser.evaluate('globalThis.__qualityFalhar=true');await browser.click('.orders-refresh');await browser.wait('Boolean(document.querySelector(".customer-inline-error"))');check('falha-sem-sucesso',await browser.evaluate('!document.querySelector(".toast-sucesso")&&document.querySelectorAll(".order-card").length===2'));
 for(const width of [768,390,320]){await viewport(width);await pagina('/perfil/pedidos');await alinhamento('pedidos-'+width);}
 await viewport(390);await browser.screenshot(path.join(outDir,'pedidos-mobile.png'));receipt.screenshots.push('pedidos-mobile.png');
 await pagina('/perfil/pedidos?vazio=1');check('cliente-sem-pedidos',await browser.evaluate('document.body.textContent.includes("Você ainda não fez nenhum pedido")&&document.querySelector(".orders-empty a").getAttribute("href")==="/cardapio"'));await alinhamento('pedidos-vazio-mobile');
 for(const route of ['/perfil','/perfil/dados','/perfil/enderecos','/perfil/pedido?id=demo']){
  for(const width of [1440,390,320]){await viewport(width);await pagina(route);await alinhamento(route.replace(/\W/g,'-')+'-'+width);if(width===390){const nome=route.replace(/\W/g,'-')+'-mobile.png';await browser.screenshot(path.join(outDir,nome));receipt.screenshots.push(nome);}}
 }
 await pagina('/perfil/enderecos?vazio=1');check('enderecos-vazios-com-card',await browser.evaluate('!!document.querySelector(".orders-empty")'));await browser.click('.addresses-heading button');check('formulario-endereco-estilizado',await browser.evaluate('!!document.querySelector(".address-form .button-secondary")'));await alinhamento('endereco-form-mobile');
 check('sem-excecoes-js',browser.errors.length===0);receipt.status='APROVADO';
}catch(e){receipt.status='REPROVADO';receipt.error=e.message;throw e;}finally{
 receipt.checkCount=receipt.checks.length;await fs.writeFile(path.join(outDir,'resultado.json'),JSON.stringify(receipt,null,2)+'\n');if(browser)await browser.close();await new Promise(r=>server.close(r));console.log(JSON.stringify(receipt));
}
