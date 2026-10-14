const validarEntrada = require('../middleware/validacaoMiddleware');
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  listarProdutos,
  buscarProduto,
} = require("../controllers/produtoController");

const router = express.Router();
router.param('lojaId',require('../lib/identificadores').parametro);
router.param('produtoId',require('../lib/identificadores').parametro);

router.get(
  "/:lojaId/produtos",
  authMiddleware,
  verificarLojaDoUsuario,
  validarEntrada,
  listarProdutos
);

router.get(
  "/:lojaId/produtos/:produtoId",
  authMiddleware,
  verificarLojaDoUsuario,
  validarEntrada,
  buscarProduto
);

module.exports = router;