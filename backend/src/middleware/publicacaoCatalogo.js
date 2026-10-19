const {ErroHttp}=require('../lib/seguranca');

// No banco existente, só ler catálogo anônimo de lojas explicitamente aprovadas.
function configurarPublicacao(env=process.env) {
  const restringir=env.APP_ENV==='homologacao' && env.GCLOUD_PROJECT==='bancorestaurante';
  if(!restringir)return null;
  let lojas;
  try{lojas=JSON.parse(env.CATALOGOS_PUBLIC_CATALOG_LOJAS || '[]');}
  catch{throw new Error('Lista de lojas com catálogo aprovado inválida.');}
  if(!Array.isArray(lojas) || lojas.length>100 || lojas.some(id=>typeof id!=='string' || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) || new Set(lojas).size!==lojas.length)throw new Error('Lista de lojas com catálogo aprovado inválida.');
  return new Set(lojas);
}
function criarGuardaCatalogo(env=process.env) {
  const lojas=configurarPublicacao(env);
  return (req,res,next)=>{
    if(lojas && !lojas.has(req.params.lojaId))return next(new ErroHttp('Catálogo indisponível.',503,'indisponibilidade'));
    next();
  };
}
module.exports={configurarPublicacao,criarGuardaCatalogo};
