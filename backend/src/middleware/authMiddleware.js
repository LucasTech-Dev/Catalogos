const { getAuth } = require("firebase-admin/auth");
const { buscarUsuarioPorId } = require("../services/usuarioService");

async function authMiddleware(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        error: "Token de autenticação não informado.",
      });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        error: "Formato do token de autenticação inválido.",
      });
    }

    const decodedToken = await getAuth().verifyIdToken(token);

    const usuario = await buscarUsuarioPorId(decodedToken.uid);

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário autenticado não possui cadastro no sistema.",
      });
    }

    if (!usuario.ativo) {
      return res.status(403).json({
        error: "Usuário está desativado.",
      });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || usuario.email,
      role: usuario.role,
      lojaId: usuario.lojaId,
      ativo: usuario.ativo,
    };

    next();
  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);

    return res.status(401).json({
      error: "Token de autenticação inválido ou expirado.",
    });
  }
}

module.exports = authMiddleware;