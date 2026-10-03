const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const verificarLojaDoUsuario = require("../middleware/lojaMiddleware");

const { buscarLoja } = require("../controllers/lojaController");

const router = express.Router();

router.get(
  "/:lojaId",
  authMiddleware,
  verificarLojaDoUsuario,
  buscarLoja
);

module.exports = router;