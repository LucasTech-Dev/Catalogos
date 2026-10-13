function proprioCliente(req, res, next) {
  if (req.user.role !== "admin" && req.params.clienteId !== req.user.uid) {
    return res.status(403).json({error: "Acesso permitido apenas aos próprios dados."});
  }
  next();
}
module.exports = proprioCliente;
