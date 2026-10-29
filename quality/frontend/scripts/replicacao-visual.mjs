// Páginas reais, duas lojas sintéticas em memória; nenhuma conexão Firebase.
import {build} from 'vite';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chrome}=require('./lib/chrome.cjs');
const root=path.resolve(import.meta.dirname,'../../..');
const identidades={a:{nome:'Cozinha Aurora',corPrimaria:'#125b45',logo:'/a.svg',imagem:'/a.svg',tituloInicio:'Sabores Aurora',descricao:'Receitas da cozinha Aurora'},b:{nome:'Cantina Boreal',corPrimaria:'#f5d34e',logo:'/b.svg',imagem:'/b.svg',tituloInicio:'Sabores Boreal',descricao:'Receitas da cantina Boreal'}};
const main=`import React from 'react';import {createRoot} from 'react-dom/client';import './styles.css';import Home from './pages/Home';import Header from './components/layout/Header';import AdminLayout from './components/admin/AdminLayout';import {personalizarLoja,aplicarIdentidade} from './lib/identidadeLoja';const id=new URLSearchParams(location.search).get('loja')||'a';globalThis.__loja=personalizarLoja({},id,${JSON.stringify(JSON.stringify(identidades))});aplicarIdentidade(globalThis.__loja);createRoot(document.getElementById('root')).render(location.pathname==='/admin'?<AdminLayout currentPath='/admin'><main className='admin-dashboard-page'><h1>Painel da loja</h1><button className='admin-primary-button'>Salvar</button></main></AdminLayout>:<><Header/><Home/></>);`;
const plugin={name:'replicacao-visual-local',enforce:'pre',transform(code,id){
 if(id.endsWith('/src/main.jsx'))return main;
 if(id.endsWith('/contexts/LojaContext.jsx'))return `export const useLoja=()=>({loja:globalThis.__loja,categorias:[],produtos:[],itens:[]});export const EstadoCatalogo=()=>null;export const CatalogoPronto=({children})=>children;`;
 if(id.endsWith('/hooks/useAcessoConta.js'))return `export const useAcessoConta=()=>({usuario:null,carregando:false,administrador:false});`;
 if(id.endsWith('/components/admin/AdminGate.jsx'))return `export const useAdminSessao=()=>({loja:globalThis.__loja,sair:()=>{}});`;
}};
const result=await build({root:path.join(root,'frontend'),envFile:false,plugins:[plugin],build:{write:false},logLevel:'error'});
const files=new Map(result.output.map(f=>['/'+f.fileName,f.type==='asset'?f.source:f.code]));
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#ddd"/><text x="40" y="150">Marca sintética</text></svg>';
const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname;res.writeHead(200,{'Content-Type':p.endsWith('.svg')?'image/svg+xml':p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html'});res.end(p.endsWith('.svg')?svg:files.get(p)||files.get('/index.html'));});
const recibo={ambiente:'Chrome local, build em memória, rede HTTPS bloqueada; sem Firebase',layouts:[],checks:[]};let browser;
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chrome();await browser.send('Network.setBlockedURLs',{urls:['https://*']});
 for(const id of ['a','b'])for(const width of [320,390,768,1366])for(const rota of ['/','/admin']){
 await browser.send('Emulation.setDeviceMetricsOverride',{width,height:960,deviceScaleFactor:1,mobile:width<600});
 await browser.navigate(`http://127.0.0.1:${server.address().port}${rota}?loja=${id}`);await browser.wait('Boolean(document.querySelector("h1"))');
 const estado=await browser.evaluate(`({largura:document.documentElement.scrollWidth,viewport:innerWidth,titulo:document.title,cor:getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),texto:document.body.innerText})`);
 assert.ok(estado.largura<=width+2,`${id}/${width}/${rota}: overflow ${estado.largura}`);assert.ok(estado.titulo.includes(identidades[id].nome));assert.equal(estado.cor,identidades[id].corPrimaria);assert.ok(!estado.texto.includes(identidades[id==='a'?'b':'a'].nome));
 if(width===320 && rota==='/'){await browser.click('.mobile-menu-toggle');assert.ok(await browser.evaluate('document.querySelector(".mobile-nav").getAttribute("aria-hidden")==="false"'));}
 recibo.layouts.push({loja:id,width,rota,ok:true});
 }
 assert.equal(browser.errors.length,0);recibo.checks=['16 layouts sem overflow e sem marca cruzada','títulos/cores por loja','menus mobile das duas lojas','zero exceções JavaScript'];
 await fs.writeFile(path.join(root,'docs/ADAPTACAO_SERVERLESS/REPLICACAO_ETAPA1_VISUAL.json'),JSON.stringify(recibo,null,2)+'\n');console.log(JSON.stringify(recibo));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
