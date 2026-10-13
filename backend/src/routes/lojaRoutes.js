const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizationMiddleware = require("../middleware/authorizationMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  buscarLoja,
  atualizarPagamentos,
} = require("../controllers/lojaController");

const router = express.Router();

router.get(
  "/:lojaId",
  authMiddleware,
  verificarLojaDoUsuario,
  buscarLoja
);

router.patch(
  "/:lojaId/pagamentos",
  authMiddleware,
  authorizationMiddleware({
    roles: ["admin"],
    exigirLoja: true,
  }),
  verificarLojaDoUsuario,
  atualizarPagamentos
);

module.exports = router;
