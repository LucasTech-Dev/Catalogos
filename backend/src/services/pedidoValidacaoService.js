const { validarDadosEntrega } = require("./pedidoEntregaService");

function validarDadosIniciaisPedido(lojaId, dadosPedido) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (
    !dadosPedido ||
    typeof dadosPedido !== "object" ||
    Array.isArray(dadosPedido)
  ) {
    throw new Error("Dados do pedido são obrigatórios.");
  }

  const {
    enderecoId = null,
    taxaEntrega = 0,
    tipoEntrega = "entrega",
  } = dadosPedido;

  const dadosEntrega = validarDadosEntrega({
    tipoEntrega,
    enderecoId,
    taxaEntrega,
  });

  return {
    ...dadosPedido,
    enderecoId: dadosEntrega.enderecoId,
    taxaEntrega: dadosEntrega.taxaEntrega,
    tipoEntrega: dadosEntrega.tipoEntrega,
  };
}

module.exports = {
  validarDadosIniciaisPedido,
};
