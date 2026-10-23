import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "API do ObraFlow funcionando" });
});

app.listen(1036, () => {
  console.log("Servidor rodando em http://localhost:1036");
});