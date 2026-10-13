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
app.use('/publico/lojas', require('./routes/publicoRoutes'));

app.get("/", (req, res) => {
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
  const status=error.type==='entity.parse.failed'?400:error.type==='entity.too.large'?413:500;
  return res.status(status).json({error:status===400?'JSON inválido.':status===413?'Requisição excede o tamanho permitido.':'Não foi possível concluir a requisição.'});
});

module.exports = app;
