const {ErroDominio}=require('./seguranca');
function identificador(valor) {
  if(typeof valor!=='string' || !valor || valor.length>128 || /[\/\\\u0000-\u001f\u007f]/.test(valor) || valor==='.' || valor==='..')throw new ErroDominio('Identificador inválido.');
  return valor;
}
function parametro(req,res,next,valor) {try{identificador(valor);next();}catch(e){res.status(400).json({error:'Identificador inválido.'});}}
module.exports={identificador,parametro};
