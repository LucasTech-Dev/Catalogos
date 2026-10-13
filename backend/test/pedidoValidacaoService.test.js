const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validarDadosIniciaisPedido,
} = require("../src/services/pedidoValidacaoService");

test("deve aceitar pedido para entrega com endereço", () => {
  const resultado = validarDadosIniciaisPedido(
    "loja-demo",
    {
      tipoEntrega: "entrega",
      enderecoId: "endereco-123",
      taxaEntrega: 5,
      itens: [{ produtoId: "burger-1", quantidade: 2 }],
    }
  );

  assert.equal(resultado.tipoEntrega, "entrega");
  assert.equal(resultado.enderecoId, "endereco-123");
  assert.equal(resultado.taxaEntrega, 5);
});

test("deve aceitar pedido para retirada sem endereço ou taxa", () => {
  const resultado = validarDadosIniciaisPedido(
    "loja-demo",
    {
      tipoEntrega: "retirada",
      itens: [{ produtoId: "burger-1", quantidade: 1 }],
    }
  );

  assert.equal(resultado.tipoEntrega, "retirada");
  assert.equal(resultado.enderecoId, null);
  assert.equal(resultado.taxaEntrega, 0);
});

test("deve rejeitar entrega sem endereço", () => {
  assert.throws(
    () =>
      validarDadosIniciaisPedido("loja-demo", {
        tipoEntrega: "entrega",
        itens: [{ produtoId: "burger-1", quantidade: 1 }],
      }),
    /enderecoId é obrigatório/
  );
});

test("deve rejeitar retirada com taxa", () => {
  assert.throws(
    () =>
      validarDadosIniciaisPedido("loja-demo", {
        tipoEntrega: "retirada",
        taxaEntrega: 5,
        itens: [{ produtoId: "burger-1", quantidade: 1 }],
      }),
    /não podem possuir taxa de entrega/
  );
});

test("deve rejeitar lojaId ausente", () => {
  assert.throws(
    () =>
      validarDadosIniciaisPedido("", {
        tipoEntrega: "retirada",
      }),
    /lojaId é obrigatório/
  );
});

test("deve rejeitar dados do pedido ausentes", () => {
  assert.throws(
    () => validarDadosIniciaisPedido("loja-demo", null),
    /Dados do pedido são obrigatórios/
  );
});
