const {ErroDominio}=require("../lib/seguranca");
const {getFirestore} = require('firebase-admin/firestore');
const {buscarLojaPorId} = require('./lojaService');
const {listarProdutosPorLoja} = require('./produtoService');
const {listarCategoriasPorLoja} = require('./categoriaService');
const db = getFirestore();
function selecionar(dados, campos) {
  return Object.fromEntries(campos.filter(c => dados[c] !== undefined).map(c => [c, dados[c]]));
}
function texto(valor, campo, obrigatorio = true) {
  if (typeof valor !== 'string' || valor.trim().length > 200 || (obrigatorio && !valor.trim())) throw new ErroDominio(`${campo} inválido.`);
  return valor.trim();
}
function validarCliente(dados) {
  const nome = texto(dados?.nome, 'Nome');
  const telefone = texto(dados?.telefone, 'Telefone');
  const digitos = telefone.replace(/\D/g, '');
  if (!/^\+?[\d\s()\-]{10,25}$/.test(telefone) || digitos.length < 10 || digitos.length > 15 || /^0+$/.test(digitos)) throw new ErroDominio('Telefone inválido.');
  return {nome, telefone};
}
function validarEndereco(dados) {
  const endereco = {};
  for (const campo of ['rua', 'numero', 'bairro', 'cidade', 'uf']) endereco[campo] = texto(dados?.[campo], campo);
  endereco.uf = endereco.uf.toUpperCase();
  if (!/^[A-Z]{2}$/.test(endereco.uf)) throw new ErroDominio('UF inválida.');
  for (const campo of ['apelido','complemento','cep']) if (dados[campo] !== undefined) endereco[campo] = texto(dados[campo], campo, false);
  return endereco;
}
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
