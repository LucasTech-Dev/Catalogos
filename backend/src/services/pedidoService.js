const {ErroDominio}=require("../lib/seguranca");
const { getFirestore } = require("firebase-admin/firestore");

const {
  validarItensDoPedido,
} = require("./pedidoItemService");

const {
  calcularValoresPedido,
} = require("./pedidoCalculoService");

const {
  validarTransicaoStatus,
} = require("./pedidoStatusService");

const {
  validarDadosIniciaisPedido,
} = require("./pedidoValidacaoService");

const {
  validarPagamentoInicial,
  validarTransicaoPagamento,
} = require("./pagamentoService");

const db = getFirestore();

function referenciaIdempotencia(lojaId,uid,chave) {
  const {identificador}=require('../lib/identificadores');identificador(lojaId);identificador(uid);
  require('../validators/base').chave(chave);
  const hash=require('node:crypto').createHash('sha256').update(uid+':'+chave).digest('hex');
  return db.collection('lojas').doc(lojaId).collection('idempotencia').doc(hash);
}
async function recuperarPedidoPelaChave(lojaId,uid,chave) {
  const doc=await referenciaIdempotencia(lojaId,uid,chave).get();
  return doc.exists?buscarPedidoPorId(lojaId,doc.data().pedidoId):null;
}
async function criarPedido(lojaId,dadosPedido,identidade={}) {
  const {identificador}=require('../lib/identificadores');identificador(lojaId);
  if(!dadosPedido || typeof dadosPedido!=='object' || Array.isArray(dadosPedido))throw new ErroDominio('Dados do pedido são obrigatórios.');
  require('../validators/pedidos').pedido(dadosPedido,{publico:identidade.publico});
  const chaveRef=identidade.chave?referenciaIdempotencia(lojaId,identidade.uid,identidade.chave):null;
  const canonico=value=>Array.isArray(value)?value.map(canonico):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonico(value[k])])):value;
  const assinatura=require('node:crypto').createHash('sha256').update(JSON.stringify(canonico(dadosPedido))).digest('hex');
  const lojaRef=db.collection('lojas').doc(lojaId),pedidoRef=lojaRef.collection('pedidos').doc();
  return db.runTransaction(async tx=>{
    if(chaveRef) {
      const anterior=await tx.get(chaveRef);
      if(anterior.exists) {
        if(anterior.data().assinatura!==assinatura)throw new ErroDominio('Chave já utilizada para outro pedido.',409);
        const salvo=await tx.get(lojaRef.collection('pedidos').doc(identificador(anterior.data().pedidoId)));
        if(!salvo.exists)throw new ErroDominio('Pedido não encontrado.',404);
        return {...salvo.data(),id:salvo.id};
      }
    }
    const docLoja=await tx.get(lojaRef),loja=docLoja.exists?docLoja.data():null;
    if(!loja || loja.ativo===false)throw new ErroDominio('Loja não encontrada ou indisponível.');
    let dados={...dadosPedido};
    if(identidade.publico) {
      dados.clienteId=identificador(identidade.uid);
      dados.tipoEntrega ??= 'entrega';
      if(dados.desconto)throw new ErroDominio('Desconto não autorizado.');
      if(dados.tipoEntrega==='retirada' && dados.taxaEntrega)throw new ErroDominio('Pedidos para retirada não podem possuir taxa de entrega.');
      const entrega=loja.entrega || {},taxa=entrega.taxa ?? loja.taxaEntrega;
      if(dados.tipoEntrega==='entrega' && entrega.habilitada!==true)throw new ErroDominio('Entrega indisponível.');
      if(dados.tipoEntrega==='retirada' && loja.retirada?.habilitada===false)throw new ErroDominio('Retirada indisponível.');
      if(dados.tipoEntrega==='entrega' && (!Number.isFinite(taxa) || taxa<0))throw new ErroDominio('Taxa de entrega não configurada.');
      dados={...dados,taxaEntrega:dados.tipoEntrega==='entrega'?taxa:0,desconto:0};
    }
    if(dados.observacao!==undefined && (typeof dados.observacao!=='string' || dados.observacao.length>1000))throw new ErroDominio('Observação inválida.');
    const validados=validarDadosIniciaisPedido(lojaId,dados);
    const {clienteId=null,enderecoId,tipoEntrega,itens,taxaEntrega,desconto=0,observacao='',pagamento,formaPagamento}=validados;
    let endereco=null;
    if(tipoEntrega==='entrega') {
      if(!clienteId)throw new ErroDominio('clienteId é obrigatório para pedidos com entrega.');
      const ref=lojaRef.collection('clientes').doc(identificador(clienteId)).collection('enderecos').doc(identificador(enderecoId));
      const doc=await tx.get(ref);if(!doc.exists)throw new ErroDominio('Endereço não encontrado para este cliente e loja.');
      endereco={...require('../lib/projecoes').endereco(doc.data()),id:doc.id};
    }
    const itensValidados=await validarItensDoPedido(lojaId,itens,tx);
    const valores=calcularValoresPedido(itensValidados,taxaEntrega,desconto);
    if(desconto>valores.subtotal+taxaEntrega)throw new ErroDominio('Desconto excede o valor do pedido.');
    if(identidade.publico && valores.subtotal<(loja.pedidoMinimo || 0))throw new ErroDominio('Pedido abaixo do valor mínimo da loja.');
    const financeiro=validarPagamentoInicial({dadosPagamento:pagamento || {forma:formaPagamento},loja,valorCalculado:valores.total});
    const cliente=dados.cliente?require('./publicoService').validarCliente(dados.cliente):null;
    const pedido={lojaId,clienteId,enderecoId,endereco,itens:itensValidados,...valores,pagamento:financeiro,observacao,tipoEntrega,status:'recebido',cliente,criadoEm:new Date(),atualizadoEm:new Date()};
    tx.set(pedidoRef,pedido);
    if(identidade.publico && cliente)tx.set(lojaRef.collection('clientes').doc(identidade.uid),{...cliente,anonimo:identidade.anonimo===true,...(identidade.email?{email:identidade.email}:{}),atualizadoEm:new Date()},{merge:true});
    if(chaveRef)tx.set(chaveRef,{assinatura,pedidoId:pedidoRef.id});
    return {id:pedidoRef.id,...pedido};
  });
}

async function buscarPedidoPorId(lojaId, pedidoId) {
  for(const id of [lojaId,pedidoId])require("../lib/identificadores").identificador(id);
  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  if (!pedidoId || typeof pedidoId !== "string") {
    throw new ErroDominio("pedidoId é obrigatório.");
  }

  const pedidoRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("pedidos")
    .doc(pedidoId);

  const snapshot = await pedidoRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  };
}

async function listarPedidos(lojaId, clienteId = null) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  let pedidosRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("pedidos");
  pedidosRef = clienteId ? pedidosRef.where("clienteId", "==", clienteId) : pedidosRef.orderBy("criadoEm", "desc");

  const snapshot = await pedidosRef.get();

  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
}

async function atualizarStatusPedido(lojaId,pedidoId,novoStatus) {
  for(const id of [lojaId,pedidoId])require('../lib/identificadores').identificador(id);
  if (!lojaId || !pedidoId || typeof novoStatus !== 'string') throw new ErroDominio('Dados de atualização inválidos.');
  const ref=db.collection('lojas').doc(lojaId).collection('pedidos').doc(pedidoId);
  return db.runTransaction(async tx=>{
    const doc=await tx.get(ref);if(!doc.exists)return null;const pedido=doc.data();
    validarTransicaoStatus(pedido.status,novoStatus);
    if (novoStatus==='pagamento_confirmado' && pedido.pagamento?.status!=='confirmado') throw new ErroDominio('Confirme explicitamente o pagamento antes de alterar o status operacional.');
    if (novoStatus==='pagamento_recusado' && pedido.pagamento?.status!=='recusado') throw new ErroDominio('Recuse explicitamente o pagamento antes de alterar o status operacional.');
    const dados={status:novoStatus,atualizadoEm:new Date()};tx.update(ref,dados);return {id:doc.id,...pedido,...dados};
  });
}
async function atualizarPagamentoPedido(lojaId,pedidoId,novoStatus) {
  for(const id of [lojaId,pedidoId])require('../lib/identificadores').identificador(id);
  if (!lojaId || !pedidoId || typeof novoStatus !== 'string') throw new ErroDominio('Dados de atualização inválidos.');
  const ref=db.collection('lojas').doc(lojaId).collection('pedidos').doc(pedidoId);
  return db.runTransaction(async tx=>{
    const doc=await tx.get(ref);if(!doc.exists)return null;const pedido=doc.data();
    if(pedido.status==='cancelado') throw new ErroDominio('Não é possível atualizar pagamento de pedido cancelado.');
    if(!pedido.pagamento) throw new ErroDominio('Pedido não possui dados de pagamento.');
    const status=validarTransicaoPagamento(pedido.pagamento.status,novoStatus);
    const dados={pagamento:{...pedido.pagamento,status,atualizadoEm:new Date()},atualizadoEm:new Date()};
    tx.update(ref,dados);return {id:doc.id,...pedido,...dados};
  });
}

module.exports = {
  criarPedido,
  recuperarPedidoPelaChave,
  buscarPedidoPorId,
  listarPedidos,
  atualizarStatusPedido,
  atualizarPagamentoPedido,
};
