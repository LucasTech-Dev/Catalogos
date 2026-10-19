const base=require('../validators/base');
const contratos=require('../validators/contratos');
const admin=require('../validators/administracao');
const perfil=require('../validators/perfil');
const pedidos=require('../validators/pedidos');
const schemas={cliente:perfil.cliente,endereco:perfil.endereco,produto:admin.produto,produtoParcial:d=>admin.produto(d,true),categoria:admin.categoria,categoriaParcial:d=>admin.categoria(d,true),loja:admin.loja,status:pedidos.status,financeiro:d=>pedidos.status(d,true),pagamentos:d=>{
  base.campos(d,['pix','dinheiro','cartao_credito','cartao_debito']);
  if(!Object.keys(d).length)throw base.erro('Informe formas de pagamento.');
  for(const [k,v] of Object.entries(d))base.booleano(v,k);
}};
function validacao(req,res,next) {
  try {
    const caminho=req.originalUrl.split('?')[0];
    const contrato=contratos.find(c=>c.metodo===(req.method==='HEAD'?'GET':req.method) && c.regex.test(caminho));
    if(!contrato)throw base.erro('Contrato de entrada não encontrado.');
    const valores=contrato.regex.exec(caminho).slice(1);
    contrato.parametros.forEach((nome,i)=>{
      const valor=decodeURIComponent(valores[i]);
      if(nome==='chave')base.chave(valor);else require('../lib/identificadores').identificador(valor);
    });
    require('../validators/consultas').consulta(req.query,contrato.query);
    if(contrato.caminho==='/lojas/:lojaId/pedidos' && req.method==='GET' && Object.keys(req.query).length) {
      if(req.user.role!=='admin')throw base.erro('Esta listagem de cliente não aceita filtros administrativos.');
      if(!req.query.limite)throw base.erro('Informe limite para a listagem paginada.');
    }
    base.estrutura(req.body);
    if(contrato.corpo==='pedido') {
      const publico=req.user.role!=='admin';
      if(publico && !req.get('Idempotency-Key'))throw base.erro('Chave de idempotência obrigatória.');
      if(req.get('Idempotency-Key')!==undefined)base.chave(req.get('Idempotency-Key'));
      pedidos.pedido(req.body,{publico});
    } else if(contrato.corpo)schemas[contrato.corpo](req.body);
    else if(req.body!==undefined && (typeof req.body!=='object' || req.body===null || Array.isArray(req.body) || Object.keys(req.body).length))throw base.erro('Esta operação não aceita corpo.');
    // req.query tem getter no Express 5; não atribuir nem converter valores globalmente.
    next();
  }catch(error) {
    return next(error);
  }
}
function estrutura(req,res,next) {
  try {base.estrutura(req.body);next();}catch(error){next(error);}
}
module.exports=validacao;
module.exports.estrutura=estrutura;
