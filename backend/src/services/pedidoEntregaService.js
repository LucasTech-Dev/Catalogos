const {ErroDominio}=require("../lib/seguranca");
const TIPOS_ENTREGA_VALIDOS = [
  "entrega",
  "retirada",
];

function validarTipoEntrega(tipoEntrega) {
  if (!TIPOS_ENTREGA_VALIDOS.includes(tipoEntrega)) {
    throw new ErroDominio(
      "Tipo de entrega inválido."
    );
  }

  return true;
}

function validarDadosEntrega({
  tipoEntrega = "entrega",
  enderecoId = null,
  taxaEntrega = 0,
}) {
  validarTipoEntrega(tipoEntrega);

  if (
    enderecoId !== null &&
    enderecoId !== undefined &&
    typeof enderecoId !== "string"
  ) {
    throw new ErroDominio(
      "enderecoId deve ser uma string ou null."
    );
  }

  if (
    typeof taxaEntrega !== "number" ||
    !Number.isFinite(taxaEntrega) ||
    taxaEntrega < 0
  ) {
    throw new ErroDominio(
      "Taxa de entrega inválida."
    );
  }

  if (tipoEntrega === "entrega") {
    if (!enderecoId) {
      throw new ErroDominio(
        "enderecoId é obrigatório para pedidos com entrega."
      );
    }
  }

  if (tipoEntrega === "retirada") {
    if (enderecoId) {
      throw new ErroDominio(
        "Pedidos para retirada não devem possuir enderecoId."
      );
    }

    if (taxaEntrega !== 0) {
      throw new ErroDominio(
        "Pedidos para retirada não podem possuir taxa de entrega."
      );
    }
  }

  return {
    tipoEntrega,
    enderecoId: enderecoId || null,
    taxaEntrega: Number(taxaEntrega.toFixed(2)),
  };
}

module.exports = {
  TIPOS_ENTREGA_VALIDOS,
  validarTipoEntrega,
  validarDadosEntrega,
};
