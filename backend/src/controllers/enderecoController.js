const {
  listarEnderecosPorCliente,
  buscarEnderecoPorId,
} = require("../services/enderecoService");

async function listarEnderecos(req, res) {
  try {
    const { lojaId, clienteId } = req.params;

    const enderecos = await listarEnderecosPorCliente(
      lojaId,
      clienteId
    );

    return res.status(200).json(enderecos);
  } catch (error) {
    console.error("Erro ao listar endereços:", error);

    return res.status(500).json({
      error: "Erro interno ao listar endereços.",
    });
  }
}

async function buscarEndereco(req, res) {
  try {
    const { lojaId, clienteId, enderecoId } = req.params;

    const endereco = await buscarEnderecoPorId(
      lojaId,
      clienteId,
      enderecoId
    );

    if (!endereco) {
      return res.status(404).json({
        error: "Endereço não encontrado.",
      });
    }

    return res.status(200).json(endereco);
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);

    return res.status(500).json({
      error: "Erro interno ao buscar endereço.",
    });
  }
}

module.exports = {
  listarEnderecos,
  buscarEndereco,
};