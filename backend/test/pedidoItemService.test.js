
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calcularValoresPedido,
} = require("../src/services/pedidoCalculoService");

test("deve calcular subtotal, taxa, desconto e total", () => {
  const itens = [
    { subtotal: 30 },
    { subtotal: 27.8 },
  ];

  const resultado = calcularValoresPedido(
    itens,
    5,
    2.5
  );

  assert.deepEqual(resultado, {
    subtotal: 57.8,
    taxaEntrega: 5,
    desconto: 2.5,
    total: 60.3,
  });
});

test("deve calcular pedido sem taxa e sem desconto", () => {
  const resultado = calcularValoresPedido(
    [{ subtotal: 25 }],
    0,
    0
  );

  assert.deepEqual(resultado, {
    subtotal: 25,
    taxaEntrega: 0,
    desconto: 0,
    total: 25,
  });
});

test("o total não deve ficar negativo quando o desconto exceder o subtotal", () => {
  const resultado = calcularValoresPedido(
    [{ subtotal: 10 }],
    0,
    15
  );

  assert.equal(resultado.total, 0);
});

test("deve rejeitar lista de itens vazia", () => {
  assert.throws(
    () => calcularValoresPedido([]),
    /Os itens do pedido são obrigatórios/
  );
});

test("deve rejeitar taxa de entrega negativa", () => {
  assert.throws(
    () =>
      calcularValoresPedido(
        [{ subtotal: 10 }],
        -1,
        0
      ),
    /Taxa de entrega inválida/
  );
});

test("deve rejeitar desconto negativo", () => {
  assert.throws(
    () =>
      calcularValoresPedido(
        [{ subtotal: 10 }],
        0,
        -1
      ),
    /Desconto inválido/
  );
});
