const {ErroHttp}=require('../lib/seguranca');
const { getAuth } = require("firebase-admin/auth");
const { buscarUsuarioPorId } = require("../services/usuarioService");

async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new ErroHttp("Token de autenticação não informado.",401,'autenticacao');
  }

  if(typeof authorization!=='string')throw new ErroHttp('Formato do token de autenticação inválido.',401,'autenticacao');
  const [scheme, token] = authorization.split(" " );

  if (scheme !== "Bearer" || !token || authorization.split(" ").length !== 2) {
    throw new ErroHttp("Formato do token de autenticação inválido.",401,'autenticacao');
  }

  let decodedToken;
  const auth=getAuth();
  try {decodedToken=await auth.verifyIdToken(token,true);}
  catch(error) {throw require('../lib/seguranca').erroAutenticacao(error);}

  try {require('../lib/identificadores').identificador(decodedToken.uid);}
  catch {throw new ErroHttp('Token de autenticação inválido ou expirado.',401,'autenticacao');}
  require('./operacao').limites.identidade(req,res,decodedToken.uid);
  const usuario = await buscarUsuarioPorId(decodedToken.uid);

  if (!usuario) {
    req.user = { uid: decodedToken.uid, email: decodedToken.email || null, role: "cliente", ativo: true, publico: true, anonimo: decodedToken.firebase?.sign_in_provider === "anonymous" };
    return next();
  }

  if (usuario.ativo !== true) {
    throw new ErroHttp("Usuário está desativado.",403,'autorizacao');
  }

  if (decodedToken.firebase?.sign_in_provider === "anonymous" && usuario.role !== "cliente") throw new ErroHttp("Sessão anônima não possui permissão administrativa.",403,'autorizacao');
  if (!["cliente","admin"].includes(usuario.role))throw new ErroHttp("Usuário não possui permissão para acessar este recurso.",403,'autorizacao');
  req.user = {
    anonimo: decodedToken.firebase?.sign_in_provider === "anonymous",
    uid: decodedToken.uid,
    email: decodedToken.email || usuario.email,
    role: usuario.role,
    lojaId: usuario.lojaId,
    ativo: usuario.ativo,
  };

  next();

}

module.exports = authMiddleware;
