const service=require('../services/adminService');
const {registrarFalha,responderErro}=require('../lib/seguranca');
function executar(fn) {return async(req,res)=>{try {await fn(req,res);}catch(error){registrarFalha('administracao',error);if(error.code===9 || error.code==='FAILED_PRECONDITION')return res.status(503).json({error:'Consulta indisponível. Verifique os índices configurados.'});return responderErro(res,error);}};}
module.exports={executar,service};
