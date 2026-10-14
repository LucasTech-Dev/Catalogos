const validarEntrada = require('../middleware/validacaoMiddleware');
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const {
  listarEnderecos,
  buscarEndereco,
} = require("../controllers/enderecoController");

const proprioCliente = require("../middleware/ownershipMiddleware");
const authorization = require("../middleware/authorizationMiddleware");
const router = express.Router();
router.param('clienteId',require('../lib/identificadores').parametro);
router.param('enderecoId',require('../lib/identificadores').parametro);
router.param('lojaId',require('../lib/identificadores').parametro);

router.get(
  "/:lojaId/clientes/:clienteId/enderecos",
  authMiddleware,
  verificarLojaDoUsuario,
  proprioCliente,
  validarEntrada,
  listarEnderecos
);

router.get(
  "/:lojaId/clientes/:clienteId/enderecos/:enderecoId",
  authMiddleware,
  verificarLojaDoUsuario,
  proprioCliente,
  validarEntrada,
  buscarEndereco
);

module.exports = router;