let app, PORT, ambienteRuntime;
try {
  ambienteRuntime = require('./config/ambiente').validarAmbiente();
  PORT = require('./config/ambiente').portaServidor(process.env.PORT);
  app = require("./app");
}
catch {
  console.error(JSON.stringify({evento:"inicializacao",status:500,codigo:"configuracao_invalida"}));
  process.exit(1);
}

function iniciarHTTP() {
const server=app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
process.once('SIGTERM',()=>{
  server.close(async()=>{try{if(ambienteRuntime.demo?.fonte!=='fixtures')await require('firebase-admin/firestore').getFirestore().terminate();process.exit(0);}catch(error){require('./lib/seguranca').registrarFalha('shutdown',error);process.exit(1);}});
  setTimeout(()=>process.exit(1),10000).unref();
});
}
if(ambienteRuntime.verificarFirebase) {
  Promise.resolve().then(()=>require('./config/conexaoFirebase').verificarConexaoFirebase(require('firebase-admin/firestore').getFirestore()))
    .then(()=>{console.log(JSON.stringify({evento:'firebase_conexao',status:200}));iniciarHTTP();})
    .catch(()=>{console.error(JSON.stringify({evento:'inicializacao',status:503,codigo:'firebase_indisponivel'}));process.exit(1);});
} else iniciarHTTP();
