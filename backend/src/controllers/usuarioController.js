const { buscarUsuarioPorId } = require("../services/usuarioService");

async function buscarUsuarioAtual(req, res) {
  try {
    const uid = req.user.uid;

    const usuario = await buscarUsuarioPorId(uid);

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado.",
      });
    }

    return res.status(200).json({...require("../lib/projecoes").usuario(usuario),id:req.user.uid,email:req.user.email});
  } catch (error) {
    require("../lib/seguranca").registrarFalha("usuarioController",error);

    return res.status(500).json({
      error: "Erro interno ao buscar usuário.",
    });
  }
}

module.exports = {
  buscarUsuarioAtual,
};