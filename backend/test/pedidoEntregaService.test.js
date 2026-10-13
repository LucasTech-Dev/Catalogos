
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  TIPOS_ENTREGA_VALIDOS,
  validarTipoEntrega,
  validarDadosEntrega,
} = require("../src/services/pedidoEntregaService");

test("deve aceitar os tipos de entrega válidos", () => {
  assert.deepEqual(TIPOS_ENTREGA_VALIDOS, [
    "entrega",
    "retirada",
  ]);

  assert.equal(validarTipoEntrega("entrega"), true);
  assert.equal(validarTipoEntrega("retirada"), true);
});

test("deve aceitar entrega com endereço e taxa", () => {
  const resultado = validarDadosEntrega({
    tipoEntrega: "entrega",
    enderecoId: "endereco-123",
    taxaEntrega: 5.5,
  });

  assert.deepEqual(resultado, {
    tipoEntrega: "entrega",
    enderecoId: "endereco-123",
    taxaEntrega: 5.5,
  });
});

test("deve rejeitar entrega sem endereço", () => {
  assert.throws(
    () =>
      validarDadosEntrega({
        tipoEntrega: "entrega",
        enderecoId: null,
        taxaEntrega: 5,
      }),
    /enderecoId é obrigatório/
  );
});

test("deve aceitar retirada sem endereço e sem taxa", () => {
  const resultado = validarDadosEntrega({
    tipoEntrega: "retirada",
    enderecoId: null,
    taxaEntrega: 0,
  });

  assert.deepEqual(resultado, {
    tipoEntrega: "retirada",
    enderecoId: null,
    taxaEntrega: 0,
  });
});

test("deve rejeitar retirada com taxa de entrega", () => {
  assert.throws(
    () =>
      validarDadosEntrega({
        tipoEntrega: "retirada",
        enderecoId: null,
        taxaEntrega: 5,
      }),
    /não podem possuir taxa de entrega/
  );
});

test("deve rejeitar retirada com endereço", () => {
  assert.throws(
    () =>
      validarDadosEntrega({
        tipoEntrega: "retirada",
        enderecoId: "endereco-123",
        taxaEntrega: 0,
      }),
    /não devem possuir enderecoId/
  );
});

test("deve rejeitar o tipo de entrega inválido", () => {
  assert.throws(
    () =>
      validarDadosEntrega({
        tipoEntrega: "delivery",
        enderecoId: "endereco-123",
        taxaEntrega: 5,
      }),
    /Tipo de entrega inválido/
  );
});

test("deve rejeitar taxa negativa", () => {
  assert.throws(
    () =>
      validarDadosEntrega({
        tipoEntrega: "entrega",
        enderecoId: "endereco-123",
        taxaEntrega: -1,
      }),
    /Taxa de entrega inválida/
  );
});

test("deve rejeitar taxa informada como texto", () => {
  assert.throws(
    () =>
      validarDadosEntrega({
        tipoEntrega: "entrega",
        enderecoId: "endereco-123",
        taxaEntrega: "5",
      }),
    /Taxa de entrega inválida/
  );
});

test("deve rejeitar endereço informado como número", () => {
  assert.throws(
    () =>
      validarDadosEntrega({
        tipoEntrega: "entrega",
        enderecoId: 123,
        taxaEntrega: 5,
      }),
    /enderecoId deve ser uma string ou null/
  );
});

test("deve rejeitar taxa infinita", () => {
  assert.throws(
    () =>
      validarDadosEntrega({
        tipoEntrega: "entrega",
        enderecoId: "endereco-123",
        taxaEntrega: Infinity,
      }),
    /Taxa de entrega inválida/
  );
});

test("deve arredondar a taxa para duas casas decimais", () => {
  const resultado = validarDadosEntrega({
    tipoEntrega: "entrega",
    enderecoId: "endereco-123",
    taxaEntrega: 5.678,
  });

  assert.equal(resultado.taxaEntrega, 5.68);
});

test("deve usar os valores padrão quando os dados opcionais forem omitidos", () => {
  assert.throws(
    () => validarDadosEntrega({}),
    /enderecoId é obrigatório/
  );
});
