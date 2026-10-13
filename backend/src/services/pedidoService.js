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
  buscarEnderecoPorId,
} = require("./enderecoService");

const {
  buscarLojaPorId,
} = require("./lojaService");

const {
  validarPagamentoInicial,
  validarTransicaoPagamento,
} = require("./pagamentoService");

const db = getFirestore();

async function criarPedido(lojaId, dadosPedido, identidade = {}) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!dadosPedido || typeof dadosPedido !== "object") {
    throw new Error("Dados do pedido são obrigatórios.");
  }

  let chaveRef = null, assinatura = null;
  if (identidade.chave) {
    if (!/^[a-zA-Z0-9_-]{16,100}$/.test(identidade.chave)) throw new Error("Chave de idempotência inválida.");
    const {createHash} = require("node:crypto");
    const hash = value => createHash("sha256").update(value).digest("hex");
    const canonico = value => Array.isArray(value) ? value.map(canonico) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k,canonico(value[k])])) : value;
    assinatura = hash(JSON.stringify(canonico(dadosPedido)));
    chaveRef = db.collection("lojas").doc(lojaId).collection("idempotencia").doc(hash(identidade.uid + ":" + identidade.chave));
    const anterior = await chaveRef.get();
    if (anterior.exists) {
      if (anterior.data().assinatura !== assinatura) throw new Error("Chave já utilizada para outro pedido.");
      return buscarPedidoPorId(lojaId, anterior.data().pedidoId);
    }
  }
  if (identidade.publico && dadosPedido.tipoEntrega === undefined) dadosPedido = {...dadosPedido,tipoEntrega:'entrega'};
  if (dadosPedido.observacao !== undefined && (typeof dadosPedido.observacao !== 'string' || dadosPedido.observacao.length > 1000)) throw new Error('Observação inválida.');
  const loja = await buscarLojaPorId(lojaId);
  if (!loja || loja.ativo === false) throw new Error("Loja não encontrada ou indisponível.");
  if (identidade.publico) {
    if (dadosPedido.desconto) throw new Error("Desconto não autorizado.");
    if (dadosPedido.tipoEntrega === "retirada" && dadosPedido.taxaEntrega) throw new Error("Pedidos para retirada não podem possuir taxa de entrega.");
    const entrega = loja.entrega || {};
    if (dadosPedido.tipoEntrega === "entrega" && entrega.habilitada !== true) throw new Error("Entrega indisponível.");
    if (dadosPedido.tipoEntrega === "retirada" && loja.retirada?.habilitada === false) throw new Error("Retirada indisponível.");
    const taxa = entrega.taxa ?? loja.taxaEntrega;
    if (dadosPedido.tipoEntrega === "entrega" && (!Number.isFinite(taxa) || taxa < 0)) throw new Error("Taxa de entrega não configurada.");
    dadosPedido = {...dadosPedido, taxaEntrega: dadosPedido.tipoEntrega === "entrega" ? taxa : 0, desconto: 0};
  }

  const dadosValidados = validarDadosIniciaisPedido(
    lojaId,
    dadosPedido
  );

  const {
    clienteId = null,
    enderecoId,
    itens,
    taxaEntrega,
    desconto = 0,
    observacao = "",
    tipoEntrega,
    pagamento,
    formaPagamento,
  } = dadosValidados;



  const dadosEntrega = {
    enderecoId,
    taxaEntrega,
    tipoEntrega,
  };

  let enderecoPedido = null;
  if (dadosEntrega.tipoEntrega === "entrega") {
    if (!clienteId || typeof clienteId !== "string") {
      throw new Error(
        "clienteId é obrigatório para pedidos com entrega."
      );
    }

    const endereco = await buscarEnderecoPorId(
      lojaId,
      clienteId,
      dadosEntrega.enderecoId
    );

    enderecoPedido = endereco;
    if (!endereco) {
      throw new Error(
        "Endereço não encontrado para este cliente e loja."
      );
    }
  }

  const itensValidados = await validarItensDoPedido(
    lojaId,
    itens
  );

  const valores = calcularValoresPedido(
    itensValidados,
    dadosEntrega.taxaEntrega,
    desconto
  );

  if (identidade.publico && valores.subtotal < (loja.pedidoMinimo || 0)) throw new Error("Pedido abaixo do valor mínimo da loja.");
  const pagamentoValidado = validarPagamentoInicial({
    dadosPagamento: pagamento || {
      forma: formaPagamento,
    },
    loja,
    valorCalculado: valores.total,
  });

  const pedidoRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("pedidos")
    .doc();

  const pedido = {
    lojaId,

    clienteId,
    cliente: dadosPedido.cliente ? require("./publicoService").validarCliente(dadosPedido.cliente) : null,
    enderecoId: dadosEntrega.enderecoId,
    endereco: enderecoPedido,

    itens: itensValidados,

    subtotal: valores.subtotal,
    taxaEntrega: valores.taxaEntrega,
    desconto: valores.desconto,
    total: valores.total,
    pagamento: pagamentoValidado,

    observacao,
    tipoEntrega: dadosEntrega.tipoEntrega,

    status: "recebido",

    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  if (chaveRef) {
    return db.runTransaction(async tx => {
      const anterior = await tx.get(chaveRef);
      if (anterior.exists) {
        if (anterior.data().assinatura !== assinatura) throw new Error("Chave já utilizada para outro pedido.");
        const salvo = await tx.get(db.collection("lojas").doc(lojaId).collection("pedidos").doc(anterior.data().pedidoId));
        return {id: salvo.id, ...salvo.data()};
      }
      tx.set(pedidoRef, pedido);
      if (identidade.publico && pedido.cliente) tx.set(db.collection('lojas').doc(lojaId).collection('clientes').doc(identidade.uid),{...pedido.cliente,anonimo:identidade.anonimo === true,...(identidade.email?{email:identidade.email}:{}),atualizadoEm:new Date()},{merge:true});
      tx.set(chaveRef, {assinatura, pedidoId: pedidoRef.id});
      return {id: pedidoRef.id, ...pedido};
    });
  }
  await pedidoRef.set(pedido);

  return {
    id: pedidoRef.id,
    ...pedido,
  };
}

async function buscarPedidoPorId(lojaId, pedidoId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!pedidoId || typeof pedidoId !== "string") {
    throw new Error("pedidoId é obrigatório.");
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
    id: snapshot.id,
    ...snapshot.data(),
  };
}

async function listarPedidos(lojaId, clienteId = null) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  let pedidosRef = db
    .collection("lojas")
    .doc(lojaId)
    .collection("pedidos");
  pedidosRef = clienteId ? pedidosRef.where("clienteId", "==", clienteId) : pedidosRef.orderBy("criadoEm", "desc");

  const snapshot = await pedidosRef.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function atualizarStatusPedido(lojaId,pedidoId,novoStatus) {
  if (!lojaId || !pedidoId || typeof novoStatus !== 'string') throw new Error('Dados de atualização inválidos.');
  const ref=db.collection('lojas').doc(lojaId).collection('pedidos').doc(pedidoId);
  return db.runTransaction(async tx=>{
    const doc=await tx.get(ref);if(!doc.exists)return null;const pedido=doc.data();
    validarTransicaoStatus(pedido.status,novoStatus);
    if (novoStatus==='pagamento_confirmado' && pedido.pagamento?.status!=='confirmado') throw new Error('Confirme explicitamente o pagamento antes de alterar o status operacional.');
    if (novoStatus==='pagamento_recusado' && pedido.pagamento?.status!=='recusado') throw new Error('Recuse explicitamente o pagamento antes de alterar o status operacional.');
    const dados={status:novoStatus,atualizadoEm:new Date()};tx.update(ref,dados);return {id:doc.id,...pedido,...dados};
  });
}
async function atualizarPagamentoPedido(lojaId,pedidoId,novoStatus) {
  if (!lojaId || !pedidoId || typeof novoStatus !== 'string') throw new Error('Dados de atualização inválidos.');
  const ref=db.collection('lojas').doc(lojaId).collection('pedidos').doc(pedidoId);
  return db.runTransaction(async tx=>{
    const doc=await tx.get(ref);if(!doc.exists)return null;const pedido=doc.data();
    if(pedido.status==='cancelado') throw new Error('Não é possível atualizar pagamento de pedido cancelado.');
    if(!pedido.pagamento) throw new Error('Pedido não possui dados de pagamento.');
    const status=validarTransicaoPagamento(pedido.pagamento.status,novoStatus);
    const dados={pagamento:{...pedido.pagamento,status,atualizadoEm:new Date()},atualizadoEm:new Date()};
    tx.update(ref,dados);return {id:doc.id,...pedido,...dados};
  });
}

module.exports = {
  criarPedido,
  buscarPedidoPorId,
  listarPedidos,
  atualizarStatusPedido,
  atualizarPagamentoPedido,
};
