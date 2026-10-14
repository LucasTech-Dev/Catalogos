const {ErroHttp}=require('../lib/seguranca');
const validarEntrada = require('../middleware/validacaoMiddleware');
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
router.param('lojaId',require('../lib/identificadores').parametro);
router.param('pedidoId',require('../lib/identificadores').parametro);

router.get('/:lojaId/pedidos/finalizacao/:chave',authMiddleware,authorizationMiddleware({roles:['cliente','admin'],exigirLoja:true}),verificarLojaDoUsuario,validarEntrada,async(req,res)=>{
    const pedido=await require('../services/pedidoService').recuperarPedidoPelaChave(req.params.lojaId,req.user.uid,req.params.chave);
    if(!pedido || (req.user.role!=='admin' && pedido.clienteId!==req.user.uid))throw new ErroHttp('Pedido não encontrado.',404,'nao_encontrado');
    return res.json(require('../lib/projecoes').pedido(pedido));
});

router.post(
  "/:lojaId/pedidos",
  authMiddleware,
  authorizationMiddleware({
    roles: ["cliente", "admin"],
    exigirLoja: true,
  }),
  verificarLojaDoUsuario,
  validarEntrada,
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
  validarEntrada,
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
  validarEntrada,
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
  validarEntrada,
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
  validarEntrada,
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
  validarEntrada,
  atualizarPagamentoDoPedido
);

module.exports = router;
