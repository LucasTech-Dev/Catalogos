const {ErroHttp}=require('../lib/seguranca');
function proprioCliente(req, res, next) {
  if (req.user.role !== "admin" && req.params.clienteId !== req.user.uid) {
    throw new ErroHttp("Acesso permitido apenas aos próprios dados.",403,'autorizacao');
  }
  next();
}
module.exports = proprioCliente;
