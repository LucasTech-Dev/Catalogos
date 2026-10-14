const {ErroHttp}=require('../lib/seguranca');
function authorizationMiddleware(opcoes = {}) {
  const {
    roles = [],
    exigirLoja = false,
  } = opcoes;

  return (req, res, next) => {
    if (!req.user) {
      throw new ErroHttp("Usuário não autenticado.",401,'autenticacao');
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new ErroHttp("Usuário não possui permissão para acessar este recurso.",403,'autorizacao');
    }

    if (exigirLoja && !req.user.lojaId && !req.user.publico) {
      throw new ErroHttp("Usuário não está vinculado a uma loja.",403,'autorizacao');
    }

    next();
  };
}

module.exports = authorizationMiddleware;