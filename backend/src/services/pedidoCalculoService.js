const {ErroDominio}=require("../lib/seguranca");

function calcularValoresPedido(
  itensValidados,
  taxaEntrega = 0,
  desconto = 0
) {
  if (
    !Array.isArray(itensValidados) ||
    itensValidados.length === 0
  ) {
    throw new ErroDominio(
      "Os itens do pedido são obrigatórios."
    );
  }

  if (
    typeof taxaEntrega !== "number" ||
    !Number.isFinite(taxaEntrega) ||
    taxaEntrega < 0
  ) {
    throw new ErroDominio("Taxa de entrega inválida.");
  }

  if (
    typeof desconto !== "number" ||
    !Number.isFinite(desconto) ||
    desconto < 0
  ) {
    throw new ErroDominio("Desconto inválido.");
  }

  require('../validators/base').dinheiro(taxaEntrega,'Taxa de entrega');
  require('../validators/base').dinheiro(desconto,'Desconto');
  for (const item of itensValidados) {
    if (
      !item ||
      typeof item.subtotal !== "number" ||
      !Number.isFinite(item.subtotal) ||
      item.subtotal < 0
    ) {
      throw new ErroDominio(
        "Subtotal de item inválido."
      );
    }
  }

  const subtotal = itensValidados.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  const total = Math.max(
    0,
    subtotal + taxaEntrega - desconto
  );

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxaEntrega: Number(taxaEntrega.toFixed(2)),
    desconto: Number(desconto.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

module.exports = {
  calcularValoresPedido,
};
