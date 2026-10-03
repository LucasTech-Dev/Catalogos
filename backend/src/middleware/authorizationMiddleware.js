function authorizationMiddleware(opcoes = {}) {
  const {
    roles = [],
    exigirLoja = false,
  } = opcoes;

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Usuário não autenticado.",
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Usuário não possui permissão para acessar este recurso.",
      });
    }

    if (exigirLoja && !req.user.lojaId) {
      return res.status(403).json({
        error: "Usuário não está vinculado a uma loja.",
      });
    }

    next();
  };
}

module.exports = authorizationMiddleware;