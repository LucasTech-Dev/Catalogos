const express = require("express");

require("./config/firebase");

const usuarioRoutes = require("./routes/usuarioRoutes");
const lojaRoutes = require("./routes/lojaRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "API do Catálogo funcionando.",
  });
});

app.use("/usuarios", usuarioRoutes);
app.use("/lojas", lojaRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});