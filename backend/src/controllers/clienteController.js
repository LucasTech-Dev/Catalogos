const {
  listarClientesPorLoja,
  buscarClientePorId,
} = require("../services/clienteService");

async function listarClientes(req, res) {
  try {
    const { lojaId } = req.params;

    const clientes = await listarClientesPorLoja(lojaId);

    return res.status(200).json(clientes);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);

    return res.status(500).json({
      error: "Erro interno ao listar clientes.",
    });
  }
}

async function buscarCliente(req, res) {
  try {
    const { lojaId, clienteId } = req.params;

    const cliente = await buscarClientePorId(
      lojaId,
      clienteId
    );

    if (!cliente) {
      return res.status(404).json({
        error: "Cliente não encontrado.",
      });
    }

    return res.status(200).json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);

    return res.status(500).json({
      error: "Erro interno ao buscar cliente.",
    });
  }
}

module.exports = {
  listarClientes,
  buscarCliente,
};