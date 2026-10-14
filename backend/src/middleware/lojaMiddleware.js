const {ErroHttp}=require('../lib/seguranca');
function verificarLojaDoUsuario(req, res, next) {
  if (!req.user) {
    throw new ErroHttp("Usuário não autenticado.",401,'autenticacao');
  }

  const lojaIdSolicitada = req.params.lojaId;

  if (!lojaIdSolicitada) {
    throw new ErroHttp("lojaId não informado.",400,'validacao');
  }

  if (req.user.publico && req.user.role === "cliente") return next();

  if (!req.user.lojaId) {
    throw new ErroHttp("Usuário não está vinculado a uma loja.",403,'autorizacao');
  }

  if (req.user.lojaId !== lojaIdSolicitada) {
    throw new ErroHttp("Usuário não possui acesso a esta loja.",403,'autorizacao');
  }

  next();
}

module.exports = verificarLojaDoUsuario;