const validarEntrada = require('../middleware/validacaoMiddleware');
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  buscarUsuarioAtual,
} = require("../controllers/usuarioController");

const router = express.Router();

router.get("/me", authMiddleware, validarEntrada, buscarUsuarioAtual);

module.exports = router;