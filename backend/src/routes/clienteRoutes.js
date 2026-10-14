const validarEntrada = require('../middleware/validacaoMiddleware');
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  listarClientes,
  buscarCliente,
} = require("../controllers/clienteController");

const proprioCliente = require("../middleware/ownershipMiddleware");
const authorization = require("../middleware/authorizationMiddleware");
const router = express.Router();
router.param('clienteId',require('../lib/identificadores').parametro);
router.param('lojaId',require('../lib/identificadores').parametro);

router.get(
  "/:lojaId/clientes",
  authMiddleware,
  verificarLojaDoUsuario,
  authorization({roles: ["admin"]}),
  validarEntrada,
  listarClientes
);

router.get(
  "/:lojaId/clientes/:clienteId",
  authMiddleware,
  verificarLojaDoUsuario,
  proprioCliente,
  validarEntrada,
  buscarCliente
);

module.exports = router;