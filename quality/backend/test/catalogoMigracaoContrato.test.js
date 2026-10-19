// Contrato de migração: service full existente -> adaptador do React publicado.
// Somente documentos fictícios em memória; sem credencial, rede ou arquivo de catálogo.
const test=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module'),path=require('node:path');
const root=path.resolve(__dirname,'../../..');
let loja,categorias,produtos;
const original=Module._load;
Module._load=function(id,parent,...args){
  if(parent?.filename===path.join(root,'backend/src/services/publicoService.js')){
    if(id==='firebase-admin/firestore')return {getFirestore:()=>({})};
    if(id==='./lojaService')return {buscarLojaPorId:async()=>loja};
    if(id==='./produtoService')return {listarProdutosPorLoja:async()=>produtos};
    if(id==='./categoriaService')return {listarCategoriasPorLoja:async()=>categorias};
  }
  return original.call(this,id,parent,...args);
};
let service;
try{service=require('../../../backend/src/services/publicoService');}finally{Module._load=original;}
const adaptar=()=>import('../../../frontend/src/services/catalogoDemo.js');
function preparar(){
  loja={id:'loja-demo',nome:'Loja fictícia',ativo:true,segredo:'sentinela-interna'};
  categorias=[{id:'c',nome:'Categoria fictícia',ativo:true,segredo:'sentinela-interna'},{id:'oculta',nome:'Oculta',ativo:false}];
  produtos=[
    {id:'p',nome:'Produto fictício',categoriaId:'c',preco:12.5,ativo:true,disponivel:true,segredo:'sentinela-interna'},
    {id:'indisponivel',nome:'Indisponível',categoriaId:'c',preco:5,ativo:true,disponivel:false},
    {id:'inativo',nome:'Inativo',categoriaId:'c',preco:6,ativo:false,disponivel:true},
    {id:'categoria-oculta',nome:'Oculto',categoriaId:'oculta',preco:7,ativo:true,disponivel:true}
  ];
}
test('migração: DTO full válido é aceito pelo React, preserva preço/indisponibilidade e não expõe campo interno',async()=>{
  preparar();const dto=await service.catalogo('loja-demo');const {adaptarCatalogoDemo}=await adaptar();
  const result=adaptarCatalogoDemo(dto);
  assert.deepEqual(result.produtos.map(p=>p.id),['p','indisponivel']);
  assert.equal(result.produtos[0].preco,12.5);assert.equal(result.produtos[1].disponivel,false);
  assert.equal(result.categorias.length,1);assert.doesNotMatch(JSON.stringify(dto),/sentinela-interna|segredo/);
});
test('migração: disponibilidade ausente no Firestore exige correção/aprovação antes de trocar a API',async()=>{
  preparar();delete produtos[0].disponivel;
  const dto=await service.catalogo('loja-demo'),{adaptarCatalogoDemo}=await adaptar();
  assert.equal(dto.produtos[0].disponivel,undefined);
  assert.throws(()=>adaptarCatalogoDemo(dto),/Produto inválido/);
});
test('migração: categoria órfã é incompatível com React e não pode ser inventada no cliente',async()=>{
  preparar();produtos[0].categoriaId='ausente';
  const dto=await service.catalogo('loja-demo'),{adaptarCatalogoDemo}=await adaptar();
  assert.throws(()=>adaptarCatalogoDemo(dto),/Produto inválido/);
});
test('migração: loja desativada não gera catálogo substituto de JSON local',async()=>{
  preparar();loja.ativo=false;assert.equal(await service.catalogo('loja-demo'),null);
});
