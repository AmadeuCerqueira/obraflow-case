import express, { type Request, type Response, type NextFunction } from "express";
import { prisma } from "./lib/prisma";
import { criarPedido } from "./services/pedidos";
import { ErroDeNegocio } from "./erros";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "API do ObraFlow funcionando" });
});

app.get("/obras", async (req, res) => {
  const obras = await prisma.obra.findMany({ orderBy: { nome: "asc" } });
  res.json(obras);
});

app.get("/fornecedores", async (req, res) => {
  const fornecedores = await prisma.fornecedor.findMany({ orderBy: { nome: "asc" } });
  res.json(fornecedores);
});

app.post("/pedidos", async (req, res) => {
  const pedido = await criarPedido(req.body);
  res.status(201).json(pedido);
});

// trata os erros de todas as rotas num lugar só. Precisa ficar depois das rotas
app.use((erro: unknown, req: Request, res: Response, next: NextFunction) => {
  if (erro instanceof ErroDeNegocio) {
    res.status(400).json({ erro: erro.message });
    return;
  }
  console.error(erro);
  res.status(500).json({ erro: "Erro inesperado no servidor." });
});

app.listen(1036, () => {
  console.log("Servidor rodando em http://localhost:1036");
});