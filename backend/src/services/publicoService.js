const {getFirestore} = require('firebase-admin/firestore');
const {buscarLojaPorId} = require('./lojaService');
const {listarProdutosPorLoja} = require('./produtoService');
const {listarCategoriasPorLoja} = require('./categoriaService');
const db = getFirestore();
function selecionar(dados, campos) {
  return Object.fromEntries(campos.filter(c => dados[c] !== undefined).map(c => [c, dados[c]]));
}
const {cliente:validarCliente,endereco:validarEndereco}=require('../validators/perfil');
async function catalogo(lojaId) {
  const loja = await buscarLojaPorId(lojaId);
  if (!loja || loja.ativo === false) return null;
  const [produtos, categorias] = await Promise.all([listarProdutosPorLoja(lojaId), listarCategoriasPorLoja(lojaId)]);
  const p=require('../lib/projecoes');
  const publicas=categorias.filter(c=>c.ativo!==false);
  const ocultas=new Set(categorias.filter(c=>c.ativo===false).map(c=>c.id));
  const publicar=(fn,d)=>{const seguro=fn(d);delete seguro.criadoEm;delete seguro.atualizadoEm;return seguro;};
  return {loja:p.loja(loja),categorias:publicas.map(c=>publicar(p.categoria,c)),produtos:produtos.filter(d=>d.ativo===true && !ocultas.has(d.categoriaId)).map(d=>publicar(p.produto,d))};

}
function clienteRef(lojaId, uid) {return db.collection('lojas').doc(lojaId).collection('clientes').doc(uid);}
module.exports = {catalogo, selecionar, validarCliente, validarEndereco, clienteRef};
