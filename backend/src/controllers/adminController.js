const service=require('../services/adminService');
function executar(fn) {return async(req,res)=>{try {await fn(req,res);} catch(error) {if(!error.status)console.error("Falha administrativa",{codigo:error.code || "interno",mensagem:error.message});const status=error.status || (error.code==='FAILED_PRECONDITION'||error.code===9?503:500);res.status(status).json({error:status===500?'Não foi possível concluir a operação administrativa.':status===503?'Consulta indisponível. Verifique os índices configurados.':error.message});}};}
module.exports={executar,service};
