const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  listarEnderecos,
  buscarEndereco,
} = require("../controllers/enderecoController");

const router = express.Router();

router.get(
  "/:lojaId/clientes/:clienteId/enderecos",
  authMiddleware,
  verificarLojaDoUsuario,
  listarEnderecos
);

router.get(
  "/:lojaId/clientes/:clienteId/enderecos/:enderecoId",
  authMiddleware,
  verificarLojaDoUsuario,
  buscarEndereco
);

module.exports = router;