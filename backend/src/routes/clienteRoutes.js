const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  listarClientes,
  buscarCliente,
} = require("../controllers/clienteController");

const router = express.Router();

router.get(
  "/:lojaId/clientes",
  authMiddleware,
  verificarLojaDoUsuario,
  listarClientes
);

router.get(
  "/:lojaId/clientes/:clienteId",
  authMiddleware,
  verificarLojaDoUsuario,
  buscarCliente
);

module.exports = router;