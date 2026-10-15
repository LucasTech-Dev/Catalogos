const {criarAppDemo}=require('./app');
const fixture=require('../../fixtures/catalogo-publico.json');

// Fonte fechada de catálogo fictício. Nenhum SDK, arquivo externo ou armazenamento persistente.
function criarAppFixtures(config,env) {
  if(config.fonte!=='fixtures' || config.lojaId!=='loja-demo')throw new Error('Fonte de demonstração inválida.');
  if(fixture.loja.id!=='loja-demo' || fixture.produtos.length>50 || fixture.categorias.length>20)throw new Error('Fixture fora dos limites.');
  const base='lojas/loja-demo',documentos=new Map([[base,fixture.loja]]);
  for(const tipo of ['categorias','produtos'])for(const doc of fixture[tipo]){
    if(!/^[A-Za-z0-9_-]{1,128}$/.test(doc.id))throw new Error('ID de fixture inválido.');
    documentos.set(base+'/'+tipo+'/'+doc.id,doc);
  }
  return criarAppDemo({lojaId:'loja-demo',aprovado:true,produtos:fixture.produtos.map(p=>p.id),categorias:fixture.categorias.map(c=>c.id)},
    ()=>{throw new Error('Firebase indisponível no modo fixtures.');},env,
    async path=>documentos.has(path)?structuredClone(documentos.get(path)):null);
}
module.exports={criarAppFixtures};
