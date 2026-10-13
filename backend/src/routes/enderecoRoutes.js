const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  listarEnderecos,
  buscarEndereco,
} = require("../controllers/enderecoController");

const proprioCliente = require("../middleware/ownershipMiddleware");
const authorization = require("../middleware/authorizationMiddleware");
const router = express.Router();

router.get(
  "/:lojaId/clientes/:clienteId/enderecos",
  authMiddleware,
  verificarLojaDoUsuario,
  proprioCliente,
  listarEnderecos
);

router.get(
  "/:lojaId/clientes/:clienteId/enderecos/:enderecoId",
  authMiddleware,
  verificarLojaDoUsuario,
  proprioCliente,
  buscarEndereco
);

module.exports = router;