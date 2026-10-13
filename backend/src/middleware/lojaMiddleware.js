function verificarLojaDoUsuario(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Usuário não autenticado.",
    });
  }

  const lojaIdSolicitada = req.params.lojaId;

  if (!lojaIdSolicitada) {
    return res.status(400).json({
      error: "lojaId não informado.",
    });
  }

  if (req.user.publico && req.user.role === "cliente") return next();

  if (!req.user.lojaId) {
    return res.status(403).json({
      error: "Usuário não está vinculado a uma loja.",
    });
  }

  if (req.user.lojaId !== lojaIdSolicitada) {
    return res.status(403).json({
      error: "Usuário não possui acesso a esta loja.",
    });
  }

  next();
}

module.exports = verificarLojaDoUsuario;