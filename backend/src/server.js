const PORT = require('./config/ambiente').portaServidor(process.env.PORT);
const app = require("./app");

const server=app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
process.once('SIGTERM',()=>{
  server.close(async()=>{try{await require('firebase-admin/firestore').getFirestore().terminate();process.exit(0);}catch(error){require('./lib/seguranca').registrarFalha('shutdown',error);process.exit(1);}});
  setTimeout(()=>process.exit(1),10000).unref();
});
