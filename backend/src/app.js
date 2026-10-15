const ambienteRuntime = require('./config/ambiente').validarAmbiente();
if (ambienteRuntime.demo) {
  require('./config/firebase');
  module.exports = require('./demo/app').criarAppDemo(ambienteRuntime.demo, () => require('firebase-admin/firestore').getFirestore(), process.env);
} else {
const express = require("express");

require("./config/firebase");

const usuarioRoutes = require("./routes/usuarioRoutes");
const lojaRoutes = require("./routes/lojaRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");
const produtoRoutes = require("./routes/produtoRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const enderecoRoutes = require("./routes/enderecoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");

const app = express();
app.disable('x-powered-by');
const erros=require('./lib/seguranca');
app.use(erros.correlacao);
app.use(require('./middleware/operacao').observar);
app.use((req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('Cache-Control','no-store');next();});
app.param("lojaId",require("./lib/identificadores").parametro);

const origens = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(o => o.trim());
app.use((req,res,next) => {
  const origem = req.get('Origin');
  if (origem && !origens.includes(origem)) return next(new erros.ErroHttp('Origem não autorizada.',403,'autorizacao'));
  if (origem) {res.set('Access-Control-Allow-Origin', origem); res.vary('Origin');}
  res.set('Access-Control-Expose-Headers','X-Request-ID, Retry-After');
  res.set('Access-Control-Allow-Headers','Content-Type, Authorization, Idempotency-Key');
  res.set('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});
app.use(require('./middleware/operacao').limites.entrada);
app.use((req,res,next)=>{
  if(['POST','PUT','PATCH'].includes(req.method) && (Number(req.get('Content-Length'))>0 || req.get('Transfer-Encoding')) && !req.is('application/json'))return next(new erros.ErroHttp('Formato da requisição não suportado.',415,'parsing'));
  next();
});
app.use(express.json({limit: '64kb'}));
app.use(require('./middleware/validacaoMiddleware').estrutura);
app.use('/publico/lojas', require('./routes/publicoRoutes'));

app.get("/", require("./middleware/validacaoMiddleware"), (req, res) => {
  return res.status(200).json({
    message: "API do Catálogo funcionando.",
  });
});

app.use("/admin/lojas/:lojaId", require("./routes/adminRoutes"));
app.use("/usuarios", usuarioRoutes);
app.use("/lojas", lojaRoutes);
app.use("/lojas", categoriaRoutes);
app.use("/lojas", produtoRoutes);
app.use("/lojas", clienteRoutes);
app.use("/lojas", enderecoRoutes);
app.use("/lojas", pedidoRoutes);

app.use(erros.rotaInexistente);
app.use(erros.tratarErro);

module.exports = app;

}
