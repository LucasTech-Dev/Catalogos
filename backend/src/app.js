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
app.param("lojaId",require("./lib/identificadores").parametro);

const origens = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(o => o.trim());
app.use((req,res,next) => {
  const origem = req.get('Origin');
  if (origem && !origens.includes(origem)) return res.status(403).json({error:'Origem não autorizada.'});
  if (origem) {res.set('Access-Control-Allow-Origin', origem); res.vary('Origin');}
  res.set('Access-Control-Allow-Headers','Content-Type, Authorization, Idempotency-Key');
  res.set('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
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

app.use((error,req,res,next)=>{
  if(res.headersSent)return next(error);
  const tipos={'entity.parse.failed':400,'entity.too.large':413,'charset.unsupported':415,'encoding.unsupported':415,'request.aborted':400,'request.size.invalid':400};
  const status=error instanceof URIError || ['Z_DATA_ERROR','Z_BUF_ERROR'].includes(error.code)?400:tipos[error.type] || 500;
  const mensagens={400:'JSON inválido.',413:'Requisição excede o tamanho permitido.',415:'Codificação da requisição não suportada.'};
  return res.status(status).json({error:mensagens[status] || 'Não foi possível concluir a requisição.'});
});

module.exports = app;
