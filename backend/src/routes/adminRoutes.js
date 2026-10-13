const router=require('express').Router({mergeParams:true});
router.param('id',require('../lib/identificadores').parametro);
const {executar,service:s}=require('../controllers/adminController');
router.use(require('../middleware/authMiddleware'),require('../middleware/authorizationMiddleware')({roles:['admin'],exigirLoja:true}),require('../middleware/lojaMiddleware'));
router.get('/sessao',executar(async(req,res)=>res.json({uid:req.user.uid,email:req.user.email,role:req.user.role,lojaId:req.user.lojaId,loja:require('../services/publicoService').selecionar(await s.buscarLoja(req.params.lojaId),['id','nome'])})));
router.get('/dashboard',executar(async(req,res)=>res.json(await s.dashboard(req.params.lojaId,req.query))));
router.get('/loja',executar(async(req,res)=>res.json(await s.buscarLoja(req.params.lojaId))));
router.patch('/loja',executar(async(req,res)=>res.json(await s.salvarLoja(req.params.lojaId,req.body))));
router.get('/pedidos/:id',executar(async(req,res)=>res.json(await s.detalhePedido(req.params.lojaId,req.params.id))));
for(const nome of ['produtos','categorias','clientes']) {
  router.get('/'+nome,executar(async(req,res)=>res.json(await s.listar(req.params.lojaId,nome,req.query))));
  if (nome !== 'clientes') router.get('/'+nome+'/:id',executar(async(req,res)=>res.json(require('../lib/projecoes')[nome==='produtos'?'produto':'categoria'](await s.buscar(req.params.lojaId,nome,req.params.id)))));
}
router.get('/clientes/:id',executar(async(req,res)=>{const d=await s.buscar(req.params.lojaId,'clientes',req.params.id);res.json(require('../lib/projecoes').cliente(d));}));
for (const [nome,salvar] of [['produtos',s.salvarProduto],['categorias',s.salvarCategoria]]) {
  router.post('/'+nome,executar(async(req,res)=>res.status(201).json(require('../lib/projecoes')[nome==='produtos'?'produto':'categoria'](await salvar(req.params.lojaId,null,req.body)))));
  router.patch('/'+nome+'/:id',executar(async(req,res)=>res.json(require('../lib/projecoes')[nome==='produtos'?'produto':'categoria'](await salvar(req.params.lojaId,req.params.id,req.body)))));
}
router.delete('/produtos/:id',executar(async(req,res)=>res.json(require('../lib/projecoes').produto(await s.desativarProduto(req.params.lojaId,req.params.id)))));
router.delete('/categorias/:id',executar(async(req,res)=>{await s.excluirCategoria(req.params.lojaId,req.params.id);res.status(204).end();}));
module.exports=router;
