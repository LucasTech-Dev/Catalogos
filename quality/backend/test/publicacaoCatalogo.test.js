const test=require('node:test'),assert=require('node:assert/strict');
const {Readable,Writable}=require('node:stream'),http=require('node:http'),Module=require('node:module');
const {configurarPublicacao}=require('../../../backend/src/middleware/publicacaoCatalogo');
const base={APP_ENV:'homologacao',GCLOUD_PROJECT:'bancorestaurante'};
function request(app,path){return new Promise((resolve,reject)=>{
 const req=new Readable({read(){this.push(null);}});req.method='GET';req.url=path;req.headers={};
 const res=new http.ServerResponse(req),chunks=[];res.assignSocket(new Writable({write(c,e,cb){chunks.push(Buffer.from(c));cb();}}));
 res.on('error',reject);res.on('finish',()=>resolve({status:res.statusCode,text:Buffer.concat(chunks).toString()}));app.handle(req,res);
});}
function appCatalogo(lista){
 const express=require('express'),file=require.resolve('../../../backend/src/routes/publicoRoutes');
 const nomes=['APP_ENV','GCLOUD_PROJECT','CATALOGOS_PUBLIC_CATALOG_LOJAS'];
 const antes=Object.fromEntries(nomes.map(k=>[k,process.env[k]]));
 const load=Module._load;let leituras=0;
 try{
  Object.assign(process.env,base);if(lista===undefined)delete process.env.CATALOGOS_PUBLIC_CATALOG_LOJAS;else process.env.CATALOGOS_PUBLIC_CATALOG_LOJAS=lista;
  Module._load=function(id,parent,...rest){
   if(parent?.filename===file){
    if(id==='../services/publicoService')return {catalogo:async()=>{leituras++;return {loja:{nome:'Sentinela aprovada'}};}};
    if(['../middleware/authMiddleware','../middleware/lojaMiddleware'].includes(id))return (q,s,n)=>n();
   }
   return load.call(this,id,parent,...rest);
  };
  delete require.cache[file];const app=express();app.use('/publico/lojas',require(file));
  app.use((e,q,s,n)=>s.status(e.status||500).json({error:'indisponivel'}));
  return {app,leituras:()=>leituras};
 }finally{Module._load=load;delete require.cache[file];for(const k of nomes)if(antes[k]===undefined)delete process.env[k];else process.env[k]=antes[k];}
}
test('rota real bloqueia todas as lojas antes de consultar dados quando não há publicação aprovada',async()=>{
 for(const lista of [undefined,'[]']){
  const {app,leituras}=appCatalogo(lista);
  for(const loja of ['loja-demo','outra-loja']){const r=await request(app,'/publico/lojas/'+loja+'/catalogo');assert.equal(r.status,503);assert.doesNotMatch(r.text,/Sentinela/);}
  assert.equal(leituras(),0);
 }
});
test('rota real consulta só loja explicitamente aprovada e mantém outra loja fechada',async()=>{
 const {app,leituras}=appCatalogo('["loja-demo"]');
 assert.equal((await request(app,'/publico/lojas/outra-loja/catalogo')).status,503);assert.equal(leituras(),0);
 assert.equal((await request(app,'/publico/lojas/loja-demo/catalogo')).status,200);assert.equal(leituras(),1);
});
test('lista inválida falha no bootstrap; ambiente local preserva o contrato existente',()=>{
 for(const v of ['null','{}','[1]','["../x"]','["x","x"]','*'])assert.throws(()=>configurarPublicacao({...base,CATALOGOS_PUBLIC_CATALOG_LOJAS:v}));
 assert.equal(configurarPublicacao({APP_ENV:'test',GCLOUD_PROJECT:'demo-teste'}),null);
});
