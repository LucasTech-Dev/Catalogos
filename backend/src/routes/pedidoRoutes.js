const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizationMiddleware = require("../middleware/authorizationMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  criarNovoPedido,
  buscarPedido,
  listarPedidosDaLoja,
  atualizarStatusDoPedido,
} = require("../controllers/pedidoController");

const router = express.Router();

router.post(
  "/:lojaId/pedidos",
  authMiddleware,
  verificarLojaDoUsuario,
  criarNovoPedido
);

router.get(
  "/:lojaId/pedidos",
  authMiddleware,
  verificarLojaDoUsuario,
  listarPedidosDaLoja
);

router.get(
  "/:lojaId/pedidos/:pedidoId",
  authMiddleware,
  verificarLojaDoUsuario,
  buscarPedido
);

router.patch(
  "/:lojaId/pedidos/:pedidoId/status",
  authMiddleware,
  authorizationMiddleware({
    roles: ["admin"],
    exigirLoja: true,
  }),
  verificarLojaDoUsuario,
  atualizarStatusDoPedido
);

module.exports = router;