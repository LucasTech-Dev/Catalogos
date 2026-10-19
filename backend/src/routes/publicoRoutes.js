const {ErroHttp}=require('../lib/seguranca');
const validarEntrada = require('../middleware/validacaoMiddleware');
const router = require('express').Router();
router.param('enderecoId',require('../lib/identificadores').parametro);
router.param('lojaId',require('../lib/identificadores').parametro);
const auth = require('../middleware/authMiddleware');
const loja = require('../middleware/lojaMiddleware');
const {catalogo, validarCliente, validarEndereco, clienteRef} = require('../services/publicoService');
const executar = fn => fn;
router.get('/:lojaId/catalogo', validarEntrada, require('../middleware/publicacaoCatalogo').criarGuardaCatalogo(), executar(async(req,res) => {
  const dados = await catalogo(req.params.lojaId);
  if(!dados)throw new ErroHttp('Loja não encontrada.',404,'nao_encontrado');
  res.json(dados);
}));
router.use('/:lojaId/me', auth, loja);
router.get('/:lojaId/me', validarEntrada, executar(async(req,res) => {
  const doc = await clienteRef(req.params.lojaId, req.user.uid).get();
  const perfil = doc.exists ? doc.data() : await require('../services/usuarioService').buscarUsuarioPorId(req.user.uid);
  res.json({...require('../lib/projecoes').textos(perfil || {},['nome','telefone']), uid:req.user.uid, email:req.user.email || '', anonimo:req.user.anonimo === true});
}));
router.put('/:lojaId/me', validarEntrada, executar(async(req,res) => {
  const dados = validarCliente(req.body);
  await clienteRef(req.params.lojaId, req.user.uid).set({...dados,anonimo:req.user.anonimo === true,...(req.user.email?{email:req.user.email}:{})}, {merge:true});
  res.json(dados);
}));
router.get('/:lojaId/me/enderecos', validarEntrada, executar(async(req,res) => {
  const docs = await clienteRef(req.params.lojaId, req.user.uid).collection('enderecos').get();
  res.json(docs.docs.map(doc => ({...require('../lib/projecoes').endereco(doc.data()), id:doc.id})));
}));
router.post('/:lojaId/me/enderecos', validarEntrada, executar(async(req,res) => {
  const dados = validarEndereco(req.body);
  const ref = clienteRef(req.params.lojaId, req.user.uid).collection('enderecos').doc();
  await ref.set(dados); res.status(201).json({...dados,id:ref.id});
}));
router.put('/:lojaId/me/enderecos/:enderecoId', validarEntrada, executar(async(req,res) => {
  const dados = validarEndereco(req.body);
  const ref = clienteRef(req.params.lojaId, req.user.uid).collection('enderecos').doc(req.params.enderecoId);
  if (!(await ref.get()).exists) throw new ErroHttp('Endereço não encontrado.',404,'nao_encontrado');
  await ref.set(dados); res.json({...dados,id:ref.id});
}));
router.delete('/:lojaId/me/enderecos/:enderecoId', validarEntrada, executar(async(req,res) => {
  await clienteRef(req.params.lojaId, req.user.uid).collection('enderecos').doc(req.params.enderecoId).delete();
  res.status(204).end();
}));
module.exports = router;
