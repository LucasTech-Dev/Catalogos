const {getFirestore} = require('firebase-admin/firestore');
const {buscarLojaPorId} = require('./lojaService');
const {listarProdutosPorLoja} = require('./produtoService');
const {listarCategoriasPorLoja} = require('./categoriaService');
const db = getFirestore();
function selecionar(dados, campos) {
  return Object.fromEntries(campos.filter(c => dados[c] !== undefined).map(c => [c, dados[c]]));
}
function texto(valor, campo, obrigatorio = true) {
  if (typeof valor !== 'string' || valor.trim().length > 200 || (obrigatorio && !valor.trim())) throw new Error(`${campo} inválido.`);
  return valor.trim();
}
function validarCliente(dados) {
  const nome = texto(dados?.nome, 'Nome');
  const telefone = texto(dados?.telefone, 'Telefone');
  const digitos = telefone.replace(/\D/g, '');
  if (!/^\+?[\d\s()\-]{10,25}$/.test(telefone) || digitos.length < 10 || digitos.length > 15 || /^0+$/.test(digitos)) throw new Error('Telefone inválido.');
  return {nome, telefone};
}
function validarEndereco(dados) {
  const endereco = {};
  for (const campo of ['rua', 'numero', 'bairro', 'cidade', 'uf']) endereco[campo] = texto(dados?.[campo], campo);
  endereco.uf = endereco.uf.toUpperCase();
  if (!/^[A-Z]{2}$/.test(endereco.uf)) throw new Error('UF inválida.');
  for (const campo of ['apelido','complemento','cep']) if (dados[campo] !== undefined) endereco[campo] = texto(dados[campo], campo, false);
  return endereco;
}
async function catalogo(lojaId) {
  const loja = await buscarLojaPorId(lojaId);
  if (!loja || loja.ativo === false) return null;
  const [produtos, categorias] = await Promise.all([listarProdutosPorLoja(lojaId), listarCategoriasPorLoja(lojaId)]);
  return {
    loja: {...selecionar(loja, ['id','nome','descricao','logo','imagem','telefone','whatsapp','endereco','corPrimaria','tempoMedio','instagram','pedidoMinimo']),
      endereco: typeof loja.endereco === 'string' ? loja.endereco : selecionar(loja.endereco || {},['rua','logradouro','numero','bairro','cidade','uf','cep','complemento']),
      horarios: typeof (loja.horarios || loja.horarioFuncionamento) === 'string' ? (loja.horarios || loja.horarioFuncionamento) : Object.fromEntries(Object.entries(loja.horarios || loja.horarioFuncionamento || {}).filter(([dia]) => ['segunda','terca','terça','quarta','quinta','sexta','sabado','sábado','domingo'].includes(dia.toLowerCase())).map(([dia,h]) => [dia,typeof h === 'string' ? h : selecionar(h || {},['abertura','fechamento','fechado'])])),
      pagamentos: Object.fromEntries(['pix','dinheiro','cartao_credito','cartao_debito'].map(forma => [forma, loja.pagamentos?.[forma] === true || (forma.startsWith('cartao_') && loja.pagamentos?.cartao === true)])),
      entrega: {habilitada: loja.entrega?.habilitada === true, taxa: loja.entrega?.taxa ?? loja.taxaEntrega ?? null},
      retirada: {habilitada: loja.retirada?.habilitada !== false}},
    categorias: categorias.filter(c => c.ativo !== false).map(c => selecionar(c,['id','nome','descricao','icone','ordem'])),
    produtos: produtos.map(p => selecionar(p,['id','nome','descricao','preco','imagem','categoriaId','ativo','disponivel','ingredientes']))
  };
}
function clienteRef(lojaId, uid) {return db.collection('lojas').doc(lojaId).collection('clientes').doc(uid);}
module.exports = {catalogo, selecionar, validarCliente, validarEndereco, clienteRef};
