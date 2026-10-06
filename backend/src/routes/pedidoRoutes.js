const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  criarNovoPedido,
  buscarPedido,
} = require("../controllers/pedidoController");

const router = express.Router();

router.post(
  "/:lojaId/pedidos",
  authMiddleware,
  verificarLojaDoUsuario,
  criarNovoPedido
);

router.get(
  "/:lojaId/pedidos/:pedidoId",
  authMiddleware,
  verificarLojaDoUsuario,
  buscarPedido
);

module.exports = router;