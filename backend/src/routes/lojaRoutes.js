const validarEntrada = require('../middleware/validacaoMiddleware');
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizationMiddleware = require("../middleware/authorizationMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  buscarLoja,
  atualizarPagamentos,
} = require("../controllers/lojaController");

const router = express.Router();
router.param('lojaId',require('../lib/identificadores').parametro);

router.get(
  "/:lojaId",
  authMiddleware,
  verificarLojaDoUsuario,
  validarEntrada,
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
  validarEntrada,
  atualizarPagamentos
);

module.exports = router;
