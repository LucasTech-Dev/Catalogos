const { getFirestore } = require("firebase-admin/firestore");

const {
  calcularValoresPedido,
} = require("./pedidoCalculoService");

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
      quantidade <= 0 || quantidade > 99
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

    if (produto.ativo !== true || produto.disponivel === false) {
      throw new Error(
        `Produto "${produtoId}" não está disponível.`
      );
    }

    if (
      typeof produto.preco !== "number" ||
      !Number.isFinite(produto.preco) || produto.preco < 0
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

module.exports = {
  validarItensDoPedido,
  calcularValoresPedido,
};
