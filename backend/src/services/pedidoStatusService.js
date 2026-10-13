const {ErroDominio}=require("../lib/seguranca");
const TRANSICOES_PERMITIDAS = {
  recebido: [
    "pagamento_confirmado",
    "cancelado",
    "pagamento_recusado",
  ],

  pagamento_confirmado: [
    "em_preparacao",
    "cancelado",
  ],

  em_preparacao: [
    "pronto",
    "cancelado",
  ],

  pronto: [
    "saiu_para_entrega",
    "entregue",
    "cancelado",
  ],

  saiu_para_entrega: [
    "entregue",
  ],

  entregue: [],

  cancelado: [],

  pagamento_recusado: [],
};

const STATUS_VALIDOS = Object.keys(TRANSICOES_PERMITIDAS);

function validarStatus(status) {
  if (!STATUS_VALIDOS.includes(status)) {
    throw new ErroDominio(`Status de pedido inválido: ${status}.`);
  }

  return true;
}

function validarTransicaoStatus(statusAtual, novoStatus) {
  validarStatus(statusAtual);
  validarStatus(novoStatus);

  if (statusAtual === novoStatus) {
    throw new ErroDominio(
      "O pedido já está nesse status."
    );
  }

  const transicoesPermitidas =
    TRANSICOES_PERMITIDAS[statusAtual];

  if (!transicoesPermitidas.includes(novoStatus)) {
    throw new ErroDominio(
      `Não é permitido alterar o pedido de "${statusAtual}" para "${novoStatus}".`
    );
  }

  return true;
}

module.exports = {
  TRANSICOES_PERMITIDAS,
  STATUS_VALIDOS,
  validarStatus,
  validarTransicaoStatus,
};