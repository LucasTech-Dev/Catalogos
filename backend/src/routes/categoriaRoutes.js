const validarEntrada = require('../middleware/validacaoMiddleware');
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  listarCategorias,
  buscarCategoria,
} = require("../controllers/categoriaController");

const router = express.Router();
router.param('categoriaId',require('../lib/identificadores').parametro);
router.param('lojaId',require('../lib/identificadores').parametro);

router.get(
  "/:lojaId/categorias",
  authMiddleware,
  verificarLojaDoUsuario,
  validarEntrada,
  listarCategorias
);

router.get(
  "/:lojaId/categorias/:categoriaId",
  authMiddleware,
  verificarLojaDoUsuario,
  validarEntrada,
  buscarCategoria
);

module.exports = router;


