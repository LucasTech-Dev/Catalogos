const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  listarProdutos,
  buscarProduto,
} = require("../controllers/produtoController");

const router = express.Router();

router.get(
  "/:lojaId/produtos",
  authMiddleware,
  verificarLojaDoUsuario,
  listarProdutos
);

router.get(
  "/:lojaId/produtos/:produtoId",
  authMiddleware,
  verificarLojaDoUsuario,
  buscarProduto
);

module.exports = router;