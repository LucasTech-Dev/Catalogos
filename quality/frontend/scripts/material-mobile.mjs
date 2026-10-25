// Regressão visual offline: App real; substituições abaixo existem somente no build em memória.
import {build} from 'vite';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chrome}=require('./lib/chrome.cjs');
const root=path.resolve(import.meta.dirname,'../../..'),outDir=path.join(root,'private-backups/material-mobile');await fs.mkdir(outDir,{recursive:true});
const produto={id:'demo',nome:'Hambúrguer da casa',descricao:'Preparado na hora.',categoria:'Lanches',categoriaId:'lanches',preco:28.9,ingredientes:['Pão','Hambúrguer'],ativo:true,disponivel:true,imagem:'/demo-produto.svg'};
const perfil={nome:'Cliente de demonstração com nome extenso',email:'cliente.demonstracao@example.invalid',telefone:'11999990000',senhaDisponivel:true};
const endereco={id:'casa',apelido:'Minha casa',rua:'Rua de exemplo',numero:'10',bairro:'Centro',cidade:'Cidade demonstrativa',uf:'SP'};
const pedido={id:'DEMO-2026-001-IDENTIFICADOR-LONGO-123456789',status:'entregue',tipoEntrega:'entrega',criadoEm:{_seconds:1792929600},cliente:perfil,itens:[{...produto,quantidade:1,subtotal:28.9}],subtotal:28.9,taxaEntrega:5,total:33.9,pagamento:{forma:'pix',status:'confirmado',origem:'manual_estabelecimento'},endereco,revisaoAdministrativa:0,transicoesStatus:[]};
const loja={id:'loja-demo',nome:'Lancheria Demo',descricao:'Lanches preparados na hora.',ativo:true,entrega:{habilitada:true,taxa:5},retirada:{habilitada:true},pagamentos:{pix:true,dinheiro:true,cartao_credito:true},telefone:'11999990000',whatsapp:'5511999990000',endereco,horarios:{},corPrimaria:'#f97316'};
const category={id:'lanches',nome:'Lanches',icone:'🍔',ativo:true,produtos:1};
const blocked=`const bloqueado=async()=>{throw Error('Escrita proibida no ensaio visual.');};`;
const main=`import React from 'react';import{createRoot}from'react-dom/client';import './styles.css';import App from './App';createRoot(document.getElementById('root')).render(<App/>);`;
const transform={name:'quality-material-offline-only',enforce:'pre',resolveId(id){if(id==='firebase/auth')return '\0quality-auth';},load(id){if(id==='\0quality-auth')return 'export const onIdTokenChanged=(auth,fn)=>{queueMicrotask(()=>fn(auth.currentUser));return()=>{};};';},transform(code,id){
 if(id.endsWith('/src/main.jsx'))return main;
 if(id.endsWith('/lib/firebase.js'))return `export const auth={currentUser:{uid:'visual-demo',isAnonymous:false},authStateReady:async()=>{}},db=null;export const sessao=async()=>auth.currentUser;`;
 if(id.endsWith('/services/api.js'))return `export const lojaId='loja-demo';export const api=async()=>{throw Error('HTTP desativado no ensaio visual.');};`;
 if(id.endsWith('/services/pedidos.js'))return `export const CRIACAO_BLOQUEADA='Bloqueada no ensaio';`;
 if(id.endsWith('/hooks/useSessao.js'))return `export const useSessao=()=>({usuario:{uid:'visual-demo'},carregando:false});`;
 if(id.endsWith('/components/admin/AdminGate.jsx'))return `export default function AdminGate({children}){return children;}export const useAdminSessao=()=>({email:'admin@example.invalid',loja:${JSON.stringify(loja)},sair:()=>{},atualizarLoja:()=>{}});`;
 if(id.endsWith('/contexts/LojaContext.jsx'))return `import React,{useState}from'react';export const LojaProvider=({children})=>children;export const CatalogoPronto=({children})=>children;export const EstadoCatalogo=()=>null;export function useLoja(){const[itens,setItens]=useState(location.search.includes('vazio')?[]:[{...${JSON.stringify(produto)},quantidade:1,adicionais:[],adicionaisTotal:0,observacao:'Sem cebola'}]);return {loja:${JSON.stringify(loja)},produtos:[${JSON.stringify(produto)}],categorias:[${JSON.stringify(category)}],itens,subtotal:itens.length*28.9,carregando:false,pronto:true,erro:'',atualizar:async()=>({ok:true}),adicionar:()=>false,alterarQuantidade:()=>{},removerItem:()=>setItens([]),limpar:()=>setItens([])};}`;
 if(id.endsWith('/services/conta.js'))return `${blocked}export const buscarPerfil=async()=>(${JSON.stringify(perfil)}),listarEnderecos=async()=>[${JSON.stringify(endereco)}];export const salvarPerfil=bloqueado,trocarSenha=bloqueado,sair=bloqueado,salvarEndereco=bloqueado,excluirEndereco=bloqueado,entrar=bloqueado,cadastrar=bloqueado,recuperar=bloqueado,entrarGoogle=bloqueado;`;
 if(id.endsWith('/services/pedidosConta.js'))return `${blocked}export const listarPedidos=async()=>[${JSON.stringify(pedido)}],buscarPedido=async()=>(${JSON.stringify(pedido)}),criarPedido=bloqueado,recuperarPedido=bloqueado,finalizarPedido=bloqueado;`;
 if(id.endsWith('/services/admin.js'))return `${blocked}const p=${JSON.stringify(pedido)},produto=${JSON.stringify(produto)},cat=${JSON.stringify(category)},cliente={id:'cliente',...${JSON.stringify(perfil)}};export const rotulosStatus={recebido:'Recebido',em_preparacao:'Em preparação',entregue:'Entregue'},classeStatus={entregue:'delivered'},dataTexto=()=> '25/10/2026';export const admin={loja:async()=>(${JSON.stringify(loja)}),dashboard:async()=>({pedidos:1,porStatus:{entregue:1},valorPedidos:33.9,valorPagamentosConfirmados:33.9,produtos:{disponiveis:1,indisponiveis:0},recentes:[p]}),listar:async nome=>({itens:nome==='produtos'?[produto]:nome==='categorias'?[cat]:nome==='clientes'?[cliente]:[p],proximoCursor:null}),buscar:async nome=>nome==='produtos'?produto:nome==='clientes'?cliente:p,salvar:bloqueado,excluir:bloqueado,configurar:bloqueado,status:bloqueado,pagamento:bloqueado};`;
}};
const result=await build({root:path.join(root,'frontend'),envFile:false,plugins:[transform],build:{write:false},logLevel:'error'});
const files=new Map(result.output.map(f=>['/'+f.fileName,f.type==='asset'?f.source:f.code]));
const server=http.createServer(async(req,res)=>{const p=new URL(req.url,'http://localhost').pathname;res.setHeader('Content-Type',p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':p.endsWith('.svg')?'image/svg+xml':'text/html');res.end(p==='/demo-produto.svg'?await fs.readFile(path.join(root,'frontend/public/demo-produto.svg')):files.get(p)||files.get('/index.html'));});
try{await fs.access(path.join(outDir,'resultado.json'));await fs.rename(path.join(outDir,'resultado.json'),path.join(outDir,'tentativa-'+Date.now()+'.json'));}catch{}
const receipt={started:new Date().toISOString(),environment:'Chrome local; App real com serviços sintéticos em build de memória; sem Firebase real. AdminGate substituído somente neste ensaio, não comprova autorização.',checks:[],layouts:[],screenshots:[]};let browser;
const check=(id,v)=>{assert.ok(v,id);receipt.checks.push({id,passed:true});};
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chrome();await browser.send('Network.setBlockedURLs',{urls:['https://*']});
 const routes=['/','/cardapio','/produto?id=demo','/carrinho','/carrinho?vazio','/checkout','/login','/cadastro','/perfil','/perfil/dados','/perfil/enderecos','/perfil/pedidos','/perfil/pedido?id=demo','/admin','/admin/pedidos','/admin/pedido?id=demo','/admin/produtos','/admin/produto/novo','/admin/produto?id=demo','/admin/categorias','/admin/clientes','/admin/configuracoes'];
 for(const width of [320,390,768,1366]){
  await browser.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<769});
  for(const route of routes){
   await browser.navigate(base+route);await browser.wait('Boolean(document.querySelector("main"))&&!document.querySelector(".page-loader")',15000);
   const layout=await browser.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,icons:document.querySelectorAll("svg.material-icon path").length,text:document.body.textContent.slice(0,80)})');receipt.layouts.push({requestedWidth:width,route,...layout});
   if(layout.scroll>width+2){await browser.screenshot(path.join(outDir,'overflow-'+width+'-'+route.replace(/\W/g,'-')+'.png'));const bad=await browser.evaluate('[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>'+width+'+2).slice(-15).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right}))');console.log(JSON.stringify({overflow:{width,route,bad}}));}
   receipt.checks.push({id:'sem-overflow-'+width+'-'+route,passed:layout.scroll<=width+2});check('material-renderizado-'+width+'-'+route,layout.icons>0);
   check('sem-emoji-'+width+'-'+route,!await browser.evaluate('/[\\p{Extended_Pictographic}]/u.test(document.body.textContent)'));
   if(route==='/produto?id=demo'){await browser.fill('#observacao-produto','Sem cebola');check('observacao-'+width,await browser.evaluate('document.querySelector(".product-observation-count").textContent.startsWith("10 / 1000")&&document.querySelector("textarea").getBoundingClientRect().width<=innerWidth'));}
   if(route==='/carrinho?vazio')check('carrinho-centrado-'+width,await browser.evaluate('(()=>{const r=document.querySelector(".cart-empty").getBoundingClientRect();return Math.abs(r.left-(document.documentElement.clientWidth-r.right))<2;})()'));
   if(width===390&&['/perfil','/produto?id=demo','/carrinho?vazio','/perfil/pedidos','/admin'].includes(route)){const file=route.replace(/\W/g,'-')+'-390.png';await browser.screenshot(path.join(outDir,file));receipt.screenshots.push(file);}
  }
  if(width<769){await browser.navigate(base+'/perfil');await browser.wait('Boolean(document.querySelector(".profile-header"))');await browser.click('.mobile-menu-toggle');check('menu-mobile-abre-'+width,await browser.evaluate('document.querySelector(".mobile-nav").classList.contains("is-open")&&document.querySelector(".mobile-menu-toggle").getAttribute("aria-expanded")==="true"'));await browser.click('.mobile-menu-toggle');check('menu-mobile-fecha-'+width,await browser.evaluate('!document.querySelector(".mobile-nav").classList.contains("is-open")'));}
 }
 check('todos-layouts-sem-overflow',receipt.layouts.every(l=>l.scroll<=l.requestedWidth+2));check('sem-excecoes-js',browser.errors.length===0);receipt.status='APROVADO';
}catch(e){receipt.status='REPROVADO';receipt.error=e.message;throw e;}finally{receipt.finished=new Date().toISOString();await fs.writeFile(path.join(outDir,'resultado.json'),JSON.stringify(receipt,null,2)+'\n');if(browser)await browser.close();await new Promise(r=>server.close(r));console.log(JSON.stringify({status:receipt.status,checks:receipt.checks.length,error:receipt.error}));}
