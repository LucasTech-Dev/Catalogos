const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function validarItensDoPedido(lojaId, itens) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error("O pedido deve possuir pelo menos um item.");
  }

  const itensValidados = [];

  for (const item of itens) {
    if (!item || typeof item !== "object") {
      throw new Error("Item do pedido inválido.");
    }

    const { produtoId, quantidade } = item;

    if (!produtoId || typeof produtoId !== "string") {
      throw new Error("produtoId é obrigatório em cada item.");
    }

    if (
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      throw new Error(
        "A quantidade de cada item deve ser um número inteiro maior que zero."
      );
    }

    const produtoRef = db
      .collection("lojas")
      .doc(lojaId)
      .collection("produtos")
      .doc(produtoId);

    const produtoSnapshot = await produtoRef.get();

    if (!produtoSnapshot.exists) {
      throw new Error(
        `Produto "${produtoId}" não encontrado.`
      );
    }

    const produto = produtoSnapshot.data();

    if (produto.ativo !== true) {
      throw new Error(
        `Produto "${produtoId}" não está disponível.`
      );
    }

    if (
      typeof produto.preco !== "number" ||
      produto.preco < 0
    ) {
      throw new Error(
        `Produto "${produtoId}" possui preço inválido.`
      );
    }

    itensValidados.push({
      produtoId,
      nome: produto.nome,
      precoUnitario: produto.preco,
      quantidade,
      subtotal: Number(
        (produto.preco * quantidade).toFixed(2)
      ),
    });
  }

  return itensValidados;
}

function calcularValoresPedido(itensValidados, taxaEntrega = 0, desconto = 0) {
  if (!Array.isArray(itensValidados) || itensValidados.length === 0) {
    throw new Error("Os itens do pedido são obrigatórios.");
  }

  if (typeof taxaEntrega !== "number" || taxaEntrega < 0) {
    throw new Error("Taxa de entrega inválida.");
  }

  if (typeof desconto !== "number" || desconto < 0) {
    throw new Error("Desconto inválido.");
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
  validarItensDoPedido,
  calcularValoresPedido,
};
