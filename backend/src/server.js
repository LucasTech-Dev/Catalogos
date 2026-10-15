const {criarApp} = require('./app');
let app, port;
try {
  port = Number(process.env.PORT || '3000');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error();
  app = criarApp();
} catch {
  console.error(JSON.stringify({evento: 'inicializacao', codigo: 'configuracao_invalida'}));
  process.exit(1);
}
const server = app.listen(port, '0.0.0.0', () => console.info('Servidor de demonstração na porta ' + port));
server.on('error', () => {console.error('Falha ao iniciar servidor.'); process.exit(1);});
process.once('SIGTERM', () => {
  server.close(() => {console.info('Servidor de demonstração encerrado.'); process.exit(0);});
  setTimeout(() => process.exit(1), 10000).unref();
});
