const {ErroDominio}=require("../lib/seguranca");
const FORMAS_PAGAMENTO = [
  "pix",
  "dinheiro",
  "cartao_credito",
  "cartao_debito",
];

const STATUS_PAGAMENTO = [
  "pendente",
  "confirmado",
  "recusado",
  "cancelado",
];

const TRANSICOES_PAGAMENTO = {
  pendente: ["confirmado", "recusado", "cancelado"],
  confirmado: [],
  recusado: [],
  cancelado: [],
};

const CAMPOS_SENSIVEIS = [
  "numeroCartao",
  "numero_cartao",
  "cardNumber",
  "cvv",
  "cvc",
  "validade",
  "senha",
  "password",
  "token",
];

function normalizarFormaPagamento(forma) {
  if (typeof forma !== "string") {
    throw new ErroDominio("Forma de pagamento é obrigatória.");
  }

  const formaNormalizada = forma.trim().toLowerCase();

  if (formaNormalizada === "cartao") {
    throw new ErroDominio(
      "Informe cartao_credito ou cartao_debito."
    );
  }

  if (!FORMAS_PAGAMENTO.includes(formaNormalizada)) {
    throw new ErroDominio(
      `Forma de pagamento inválida: ${forma}.`
    );
  }

  return formaNormalizada;
}

function normalizarStatusPagamento(status) {
  if (typeof status !== "string") {
    throw new ErroDominio("Status de pagamento é obrigatório.");
  }

  const statusNormalizado = status.trim().toLowerCase();

  if (!STATUS_PAGAMENTO.includes(statusNormalizado)) {
    throw new ErroDominio(
      `Status de pagamento inválido: ${status}.`
    );
  }

  return statusNormalizado;
}

function detectarDadosSensiveis(dados, caminho = "") {
  if (!dados || typeof dados !== "object") {
    return null;
  }

  for (const [campo, valor] of Object.entries(dados)) {
    const campoNormalizado = campo.toLowerCase();
    const caminhoAtual = caminho ? `${caminho}.${campo}` : campo;

    if (
      CAMPOS_SENSIVEIS.some((sensivel) =>
        campoNormalizado.includes(sensivel.toLowerCase())
      )
    ) {
      return caminhoAtual;
    }

    if (valor && typeof valor === "object") {
      const encontrado = detectarDadosSensiveis(
        valor,
        caminhoAtual
      );

      if (encontrado) {
        return encontrado;
      }
    }
  }

  return null;
}

function formaHabilitadaNaLoja(forma, pagamentosLoja) {
  if (!pagamentosLoja || typeof pagamentosLoja !== "object") {
    return false;
  }

  if (pagamentosLoja[forma] === true) {
    return true;
  }

  if (
    (forma === "cartao_credito" ||
      forma === "cartao_debito") &&
    pagamentosLoja.cartao === true
  ) {
    return true;
  }

  return false;
}

function validarConfiguracaoPagamentos(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw new ErroDominio(
      "Configuração de pagamentos é obrigatória."
    );
  }

  require('../validators/base').campos(dados,FORMAS_PAGAMENTO);
  const configuracao = {};

  for (const forma of FORMAS_PAGAMENTO) {
    if (
      dados[forma] !== undefined &&
      typeof dados[forma] !== "boolean"
    ) {
      throw new ErroDominio(
        `Configuração de pagamento inválida para ${forma}.`
      );
    }

    configuracao[forma] = dados[forma] === true;
  }

  if(!Object.values(configuracao).some(Boolean))throw new ErroDominio("Habilite ao menos uma forma de pagamento.");
  return configuracao;
}

function validarPagamentoInicial({
  dadosPagamento,
  loja,
  valorCalculado,
}) {
  const validacao=require('../validators/base');
  validacao.dinheiro(valorCalculado,'Valor calculado',validacao.LIMITES.monetario*(validacao.LIMITES.quantidadePedido+1));
  validacao.estrutura(dadosPagamento);
  const campoSensivel = detectarDadosSensiveis(dadosPagamento);

  if (campoSensivel) {
    throw new ErroDominio(
      `Dados sensíveis de pagamento não devem ser enviados: ${campoSensivel}.`
    );
  }

  if (
    !dadosPagamento ||
    typeof dadosPagamento !== "object" ||
    Array.isArray(dadosPagamento)
  ) {
    throw new ErroDominio("Dados de pagamento são obrigatórios.");
  }

  require('../validators/pedidos').pagamento(dadosPagamento);
  const forma = normalizarFormaPagamento(dadosPagamento.forma);

  if (
    dadosPagamento.status !== undefined &&
    dadosPagamento.status !== "pendente"
  ) {
    throw new ErroDominio(
      "O cliente não pode confirmar ou alterar o status do pagamento."
    );
  }

  if (
    dadosPagamento.valor !== undefined &&
    Number(dadosPagamento.valor.toFixed?.(2) ?? dadosPagamento.valor) !==
      Number(valorCalculado.toFixed(2))
  ) {
    throw new ErroDominio(
      "Valor de pagamento divergente do total calculado pelo servidor."
    );
  }

  if (!formaHabilitadaNaLoja(forma, loja?.pagamentos)) {
    throw new ErroDominio(
      `Forma de pagamento "${forma}" não está habilitada para esta loja.`
    );
  }

  return {
    forma,
    status: "pendente",
    valor: Number(valorCalculado.toFixed(2)),
  };
}

function validarTransicaoPagamento(statusAtual, novoStatus) {
  const atual = normalizarStatusPagamento(statusAtual);
  const proximo = normalizarStatusPagamento(novoStatus);

  if (atual === proximo) {
    throw new ErroDominio(
      "O pagamento já está nesse status."
    );
  }

  if (!TRANSICOES_PAGAMENTO[atual].includes(proximo)) {
    throw new ErroDominio(
      `Não é permitido alterar o pagamento de "${atual}" para "${proximo}".`
    );
  }

  return proximo;
}

module.exports = {
  detectarDadosSensiveis,
  formaHabilitadaNaLoja,
  FORMAS_PAGAMENTO,
  STATUS_PAGAMENTO,
  TRANSICOES_PAGAMENTO,
  normalizarFormaPagamento,
  normalizarStatusPagamento,
  validarConfiguracaoPagamentos,
  validarPagamentoInicial,
  validarTransicaoPagamento,
};
