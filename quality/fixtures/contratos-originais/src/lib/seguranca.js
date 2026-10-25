const {randomUUID}=require('node:crypto');
const MENSAGENS={400:'Entrada inválida.',401:'Token de autenticação inválido ou expirado.',403:'Acesso negado.',404:'Recurso não encontrado.',409:'Conflito na operação.',413:'Requisição excede o tamanho permitido.',415:'Codificação da requisição não suportada.',429:'Limite de requisições excedido.',500:'Não foi possível concluir a operação.',503:'Serviço temporariamente indisponível. Tente novamente.'};
class ErroHttp extends Error {
  constructor(mensagem,status=500,categoria='interno') {
    super(mensagem);this.status=Object.hasOwn(MENSAGENS,status)?status:500;this.categoria=categoria;
  }
}
class ErroDominio extends ErroHttp {
  constructor(mensagem,status=400,categoria=status===409?'conflito':status===404?'nao_encontrado':'dominio') {super(mensagem,status,categoria);this.expor=true;}
}
const CREDENCIAIS=new Set(['auth/id-token-expired','auth/id-token-revoked','auth/invalid-id-token','auth/argument-error','auth/user-disabled','auth/user-not-found']);
const TEMPORARIOS=new Set([1,4,8,9,10,14,'CANCELLED','DEADLINE_EXCEEDED','RESOURCE_EXHAUSTED','FAILED_PRECONDITION','ABORTED','UNAVAILABLE','cancelled','deadline-exceeded','resource-exhausted','failed-precondition','aborted','unavailable','firestore/unavailable','firestore/deadline-exceeded','auth/network-request-failed','app/network-error','ECONNRESET','ECONNREFUSED','ETIMEDOUT','EAI_AGAIN','ENOTFOUND']);
const PARSER={'entity.parse.failed':400,'entity.too.large':413,'charset.unsupported':415,'encoding.unsupported':415,'request.aborted':400,'request.size.invalid':400};
function erroAutenticacao(error) {
  // Apenas erros de credenciais vindos da verificação do token são 401.
  return CREDENCIAIS.has(error?.code)?new ErroHttp(MENSAGENS[401],401,'autenticacao'):error;
}
function classificar(error) {
  if(error instanceof ErroHttp)return {status:error.status,mensagem:error.status<500?error.message:MENSAGENS[error.status],categoria:['validacao','autenticacao','autorizacao','nao_encontrado','conflito','dominio','parsing','servico_externo','interno'].includes(error.categoria)?error.categoria:'interno',codigo:'dominio'};
  if(error instanceof URIError || ['Z_DATA_ERROR','Z_BUF_ERROR'].includes(error?.code))return {status:400,mensagem:'JSON inválido.',categoria:'parsing',codigo:'parsing'};
  if(Object.hasOwn(PARSER,error?.type || '')) {
    const status=PARSER[error.type];return {status,mensagem:status===400?'JSON inválido.':MENSAGENS[status],categoria:'parsing',codigo:error.type};
  }
  if(TEMPORARIOS.has(error?.code))return {status:503,mensagem:MENSAGENS[503],categoria:'servico_externo',codigo:error.code};
  const diagnostico=Number.isInteger(error?.code) && error.code>=0 && error.code<=16?error.code:['auth/internal-error','auth/insufficient-permission','auth/invalid-credential'].includes(error?.code)?error.code:'interno';
  return {status:500,mensagem:MENSAGENS[500],categoria:'interno',codigo:diagnostico};
}
function registrarFalha(evento,error,requestId) {
  const resultado=classificar(error);
  console.error(JSON.stringify({evento:typeof evento==='string' && /^[a-zA-Z0-9_-]{1,64}$/.test(evento)?evento:'requisicao',categoria:resultado.categoria,status:resultado.status,codigo:resultado.codigo,...(/^[\da-f-]{36}$/i.test(requestId || '')?{requestId}:{})}));
}
function responderErro(res,error) {
  const {status,mensagem}=classificar(error);return res.status(status).json({error:mensagem});
}
function correlacao(req,res,next) {
  req.requestId=randomUUID();res.set('X-Request-ID',req.requestId);next();
}
function rotaInexistente(req,res,next) {next(new ErroHttp('Rota não encontrada.',404,'nao_encontrado'));}
function tratarErro(error,req,res,next) {
  const resultado=classificar(error);
  if(resultado.status>=500)registrarFalha('http',error,req.requestId);
  // Depois de começar uma resposta, não é possível substituí-la por JSON.
  // Fechar sem erro bruto evita o logger padrão expor a exceção original.
  if(res.headersSent){res.destroy();return;}
  return responderErro(res,error);
}
module.exports={ErroHttp,ErroDominio,classificar,erroAutenticacao,registrarFalha,responderErro,correlacao,rotaInexistente,tratarErro};
