const { buscarEnderecoPorId } = require("./enderecoService");
const { buscarLojaPorId } = require("./lojaService");
const { buscarPedidoPorId } = require("./pedidoService");

const STATUS_PEDIDO_INCOMPATIVEIS = [
  "cancelado",
  "pagamento_recusado",
];

function formatarMoeda(valor) {
  if (
    typeof valor !== "number" ||
    !Number.isFinite(valor)
  ) {
    throw new Error("Valor monetário inválido.");
  }

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalizarWhatsapp(numero) {
  if (!numero || typeof numero !== "string") {
    throw new Error(
      "WhatsApp da loja não está configurado."
    );
  }

  let digitos = numero.replace(/\D/g, "");

  if (digitos.startsWith("00")) {
    digitos = digitos.slice(2);
  }

  if (digitos.length === 10 || digitos.length === 11) {
    digitos = `55${digitos}`;
  }

  if (
    digitos.length < 12 ||
    digitos.length > 15 ||
    /^0+$/.test(digitos)
  ) {
    throw new Error(
      "WhatsApp da loja possui formato inválido."
    );
  }

  return digitos;
}

function rotuloFormaPagamento(forma) {
  const rotulos = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    cartao_credito: "Cartão de crédito",
    cartao_debito: "Cartão de débito",
  };

  return rotulos[forma] || forma || "Não informado";
}

function rotuloStatusPagamento(status) {
  const rotulos = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    recusado: "Recusado",
    cancelado: "Cancelado",
  };

  return rotulos[status] || status || "Não informado";
}

function formatarEndereco(endereco) {
  if (!endereco || typeof endereco !== "object") {
    return null;
  }

  const partes = [
    endereco.rua || endereco.logradouro,
    endereco.numero,
    endereco.bairro,
    endereco.cidade,
    endereco.uf,
  ].filter(Boolean);

  if (partes.length === 0) {
    return null;
  }

  return partes.join(", ");
}

function montarMensagemWhatsApp({
  loja,
  pedido,
  endereco,
}) {
  if (!loja || typeof loja !== "object") {
    throw new Error("Dados da loja são obrigatórios.");
  }

  if (!pedido || typeof pedido !== "object") {
    throw new Error("Dados do pedido são obrigatórios.");
  }

  if (!Array.isArray(pedido.itens) || pedido.itens.length === 0) {
    throw new Error(
      "Pedido não possui itens para envio ao WhatsApp."
    );
  }

  const linhas = [
    `Olá! Gostaria de finalizar o pedido ${pedido.id ? `#${pedido.id}` : ""}.`.trim(),
    "",
    `Loja: ${loja.nome || pedido.lojaId}`,
  ];

  if (pedido.cliente?.nome) {
    linhas.push(`Cliente: ${pedido.cliente.nome}`);
  }

  if (pedido.cliente?.telefone) {
    linhas.push(`Telefone: ${pedido.cliente.telefone}`);
  }

  linhas.push("", "Itens:");

  for (const item of pedido.itens) {
    const quantidade = item.quantidade || 0;
    const nome = item.nome || item.produtoId || "Produto";
    const preco = formatarMoeda(item.precoUnitario || 0);
    const subtotal = formatarMoeda(item.subtotal || 0);

    linhas.push(
      `${quantidade}x ${nome} - ${preco} = ${subtotal}`
    );
  }

  linhas.push(
    "",
    `Subtotal: ${formatarMoeda(pedido.subtotal || 0)}`,
    `Entrega: ${formatarMoeda(pedido.taxaEntrega || 0)}`,
    `Desconto: ${formatarMoeda(pedido.desconto || 0)}`,
    `Total: ${formatarMoeda(pedido.total || 0)}`,
    "",
    `Tipo: ${
      pedido.tipoEntrega === "retirada"
        ? "Retirada"
        : "Entrega"
    }`
  );

  if (pedido.tipoEntrega === "entrega") {
    const enderecoFormatado = formatarEndereco(endereco);

    linhas.push(
      `Endereço: ${
        enderecoFormatado ||
        pedido.enderecoTexto ||
        pedido.enderecoId ||
        "Não informado"
      }`
    );
  }

  if (pedido.observacao) {
    linhas.push("", `Observação: ${pedido.observacao}`);
  }

  linhas.push(
    "",
    `Pagamento: ${rotuloFormaPagamento(pedido.pagamento?.forma)}`,
    `Status do pagamento: ${rotuloStatusPagamento(
      pedido.pagamento?.status
    )}`
  );

  return linhas.join("\n");
}

async function gerarFinalizacaoWhatsApp(lojaId, pedidoId) {
  if (!lojaId || typeof lojaId !== "string") {
    throw new Error("lojaId é obrigatório.");
  }

  if (!pedidoId || typeof pedidoId !== "string") {
    throw new Error("pedidoId é obrigatório.");
  }

  const [loja, pedido] = await Promise.all([
    buscarLojaPorId(lojaId),
    buscarPedidoPorId(lojaId, pedidoId),
  ]);

  if (!loja) {
    throw new Error("Loja não encontrada.");
  }

  if (!pedido) {
    return null;
  }

  if (STATUS_PEDIDO_INCOMPATIVEIS.includes(pedido.status)) {
    throw new Error(
      "Pedido não pode ser finalizado pelo WhatsApp neste status."
    );
  }

  let endereco = null;

  if (pedido.tipoEntrega === "entrega") {
    endereco = pedido.endereco || await buscarEnderecoPorId(
      lojaId,
      pedido.clienteId,
      pedido.enderecoId
    );

    if (!endereco) {
      throw new Error(
        "Endereço do pedido não encontrado para finalização."
      );
    }
  }

  const numero = normalizarWhatsapp(loja.whatsapp);
  const mensagem = montarMensagemWhatsApp({
    loja,
    pedido,
    endereco,
  });
  const mensagemCodificada = encodeURIComponent(mensagem);

  return {
    pedidoId,
    lojaId,
    numero,
    mensagem,
    mensagemCodificada,
    url: `https://wa.me/${numero}?text=${mensagemCodificada}`,
    observacao:
      "A geração desta URL não confirma pedido, pagamento ou envio da mensagem.",
  };
}

module.exports = {
  STATUS_PEDIDO_INCOMPATIVEIS,
  formatarMoeda,
  normalizarWhatsapp,
  montarMensagemWhatsApp,
  gerarFinalizacaoWhatsApp,
};
