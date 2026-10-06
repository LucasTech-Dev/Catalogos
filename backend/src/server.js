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

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "API do Catálogo funcionando.",
  });
});

app.use("/usuarios", usuarioRoutes);
app.use("/lojas", lojaRoutes);
app.use("/lojas", categoriaRoutes);
app.use("/lojas", produtoRoutes);
app.use("/lojas", clienteRoutes);
app.use("/lojas", enderecoRoutes);
app.use("/lojas", pedidoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});