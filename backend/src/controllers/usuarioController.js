const {ErroHttp}=require('../lib/seguranca');
const { buscarUsuarioPorId } = require("../services/usuarioService");

async function buscarUsuarioAtual(req, res) {
  const uid = req.user.uid;

  const usuario = await buscarUsuarioPorId(uid);

  if (!usuario) {
    throw new ErroHttp("Usuário não encontrado.",404,'nao_encontrado');
  }

  return res.status(200).json({...require("../lib/projecoes").usuario(usuario),id:req.user.uid,email:req.user.email});
}

module.exports = {
  buscarUsuarioAtual,
};