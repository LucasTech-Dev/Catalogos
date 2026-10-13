const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizationMiddleware = require("../middleware/authorizationMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  criarNovoPedido,
  buscarPedido,
  listarPedidosDaLoja,
  atualizarStatusDoPedido,
  atualizarPagamentoDoPedido,
  gerarWhatsappDoPedido,
} = require("../controllers/pedidoController");

const router = express.Router();

router.post(
  "/:lojaId/pedidos",
  authMiddleware,
  authorizationMiddleware({
    roles: ["cliente", "admin"],
    exigirLoja: true,
  }),
  verificarLojaDoUsuario,
  criarNovoPedido
);

router.get(
  "/:lojaId/pedidos",
  authMiddleware,
  authorizationMiddleware({
    roles: ["cliente", "admin"],
    exigirLoja: true,
  }),
  verificarLojaDoUsuario,
  listarPedidosDaLoja
);

router.get(
  "/:lojaId/pedidos/:pedidoId",
  authMiddleware,
  authorizationMiddleware({
    roles: ["cliente", "admin"],
    exigirLoja: true,
  }),
  verificarLojaDoUsuario,
  buscarPedido
);

router.get(
  "/:lojaId/pedidos/:pedidoId/whatsapp",
  authMiddleware,
  authorizationMiddleware({
    roles: ["cliente", "admin"],
    exigirLoja: true,
  }),
  verificarLojaDoUsuario,
  gerarWhatsappDoPedido
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

router.patch(
  "/:lojaId/pedidos/:pedidoId/pagamento",
  authMiddleware,
  authorizationMiddleware({
    roles: ["admin"],
    exigirLoja: true,
  }),
  verificarLojaDoUsuario,
  atualizarPagamentoDoPedido
);

module.exports = router;
