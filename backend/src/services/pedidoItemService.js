const {ErroDominio}=require("../lib/seguranca");
const { getFirestore } = require("firebase-admin/firestore");

const {
  calcularValoresPedido,
} = require("./pedidoCalculoService");

const db = getFirestore();

async function validarItensDoPedido(lojaId, itens, tx = null) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new ErroDominio("lojaId é obrigatório.");
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    throw new ErroDominio("O pedido deve possuir pelo menos um item.");
  }

  require('../validators/pedidos').itens(itens);
  const itensValidados = [];

  for (const item of itens) {
    if (!item || typeof item !== "object") {
      throw new ErroDominio("Item do pedido inválido.");
    }

    const { produtoId, quantidade } = item;

    if (!produtoId || typeof produtoId !== "string") {
      throw new ErroDominio("produtoId é obrigatório em cada item.");
    }

    if (
      !Number.isInteger(quantidade) ||
      quantidade <= 0 || quantidade > 99
    ) {
      throw new ErroDominio(
        "A quantidade de cada item deve ser um número inteiro maior que zero."
      );
    }

    require("../lib/identificadores").identificador(produtoId);
    const produtoRef = db
      .collection("lojas")
      .doc(lojaId)
      .collection("produtos")
      .doc(produtoId);

    const produtoSnapshot = await (tx ? tx.get(produtoRef) : produtoRef.get());

    if (!produtoSnapshot.exists) {
      throw new ErroDominio(
        `Produto "${produtoId}" não encontrado.`
      );
    }

    const produto = produtoSnapshot.data();

    if (produto.ativo !== true || produto.disponivel === false) {
      throw new ErroDominio(
        `Produto "${produtoId}" não está disponível.`
      );
    }

    if (
      typeof produto.preco !== "number" ||
      !Number.isFinite(produto.preco) || produto.preco < 0
    ) {
      throw new ErroDominio(
        `Produto "${produtoId}" possui preço inválido.`
      );
    }

    require('../validators/base').dinheiro(produto.preco,'Preço do produto');
    if(produto.categoriaId) {
      require('../lib/identificadores').identificador(produto.categoriaId);
      const ref=db.collection('lojas').doc(lojaId).collection('categorias').doc(produto.categoriaId);
      const categoria=await (tx?tx.get(ref):ref.get());
      if(!categoria.exists || categoria.data().ativo===false)throw new ErroDominio('Categoria do produto não está disponível.');
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
