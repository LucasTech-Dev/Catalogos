const { getAuth } = require("firebase-admin/auth");

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

    req.user = decodedToken;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token de autenticação inválido ou expirado.",
    });
  }
}

module.exports = authMiddleware;
