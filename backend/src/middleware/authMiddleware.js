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

    if (scheme !== "Bearer" || !token || authorization.split(" ").length !== 2) {
      return res.status(401).json({
        error: "Formato do token de autenticação inválido.",
      });
    }

    const decodedToken = await getAuth().verifyIdToken(token, true);

    require("../lib/identificadores").identificador(decodedToken.uid);
    const usuario = await buscarUsuarioPorId(decodedToken.uid);

    if (!usuario) {
      req.user = { uid: decodedToken.uid, email: decodedToken.email || null, role: "cliente", ativo: true, publico: true, anonimo: decodedToken.firebase?.sign_in_provider === "anonymous" };
      return next();
    }

    if (usuario.ativo !== true) {
      return res.status(403).json({
        error: "Usuário está desativado.",
      });
    }

    if (decodedToken.firebase?.sign_in_provider === "anonymous" && usuario.role !== "cliente") return res.status(403).json({error:"Sessão anônima não possui permissão administrativa."});
    if (!["cliente","admin"].includes(usuario.role))return res.status(403).json({error:"Usuário não possui permissão para acessar este recurso."});
    req.user = {
      anonimo: decodedToken.firebase?.sign_in_provider === "anonymous",
      uid: decodedToken.uid,
      email: decodedToken.email || usuario.email,
      role: usuario.role,
      lojaId: usuario.lojaId,
      ativo: usuario.ativo,
    };

    next();
  } catch (error) {
    require("../lib/seguranca").registrarFalha("autenticacao",error);

    return res.status(401).json({
      error: "Token de autenticação inválido ou expirado.",
    });
  }
}

module.exports = authMiddleware;