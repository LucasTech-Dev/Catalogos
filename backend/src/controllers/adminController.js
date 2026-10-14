const service=require('../services/adminService');
// Express 5 encaminha as rejeições dos handlers async ao middleware global.
function executar(fn) {return fn;}
module.exports={executar,service};
