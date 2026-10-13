class ErroDominio extends Error {
  constructor(mensagem,status=400) {super(mensagem);this.status=status;this.expor=true;}
}
const CODIGOS=new Set(['auth/id-token-expired','auth/id-token-revoked','auth/invalid-id-token','auth/argument-error','auth/user-disabled','auth/user-not-found']);
function registrarFalha(evento,error) {
  const codigo=Number.isInteger(error?.code) && error.code>=0 && error.code<=16 ? error.code : CODIGOS.has(error?.code) ? error.code : 'interno';
  console.error(JSON.stringify({evento,codigo}));
}
function responderErro(res,error) {
  const status=error?.expor===true && error.status>=400 && error.status<500 ? error.status : 500;
  return res.status(status).json({error:status===500?'Não foi possível concluir a operação.':error.message});
}
module.exports={ErroDominio,registrarFalha,responderErro};
