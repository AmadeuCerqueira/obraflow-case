import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { criarPedido, decidirPedido } from "./services/pedidos";
import { ErroDeNegocio } from "./erros";
import { listarRegras, salvarRegras } from "./services/regras";

const app = express();
app.use(cors());
app.use(express.json());

// converte o id que vem na URL ou no corpo para número, e recusa se não for válido
function lerId(valor: unknown): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErroDeNegocio("Identificador inválido.");
  }
  return id;
}

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

app.get("/usuarios", async (req, res) => {
  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: "asc" } });
  res.json(usuarios);
});

app.get("/pedidos", async (req, res) => {
  const pedidos = await prisma.pedido.findMany({
    orderBy: { dataPedido: "desc" },
    include: {
      obra: true,
      fornecedor: true,
      etapas: { orderBy: { ordem: "asc" }, include: { usuario: true } },
    },
  });
  res.json(pedidos);
});

app.get("/pedidos/:id", async (req, res) => {
  const pedido = await prisma.pedido.findUnique({
    where: { idPedido: lerId(req.params.id) },
    include: {
      obra: true,
      fornecedor: true,
      itens: true,
      etapas: { orderBy: { ordem: "asc" }, include: { usuario: true } },
    },
  });
  if (!pedido) {
    res.status(404).json({ erro: "Pedido não encontrado." });
    return;
  }
  res.json(pedido);
});

app.post("/pedidos", async (req, res) => {
  const pedido = await criarPedido(req.body);
  res.status(201).json(pedido);
});

app.post("/pedidos/:id/aprovar", async (req, res) => {
  const pedido = await decidirPedido(lerId(req.params.id), lerId(req.body.idUsuario), "APROVADO");
  res.json(pedido);
});

app.post("/pedidos/:id/rejeitar", async (req, res) => {
  const pedido = await decidirPedido(
    lerId(req.params.id),
    lerId(req.body.idUsuario),
    "REJEITADO",
    req.body.motivo
  );
  res.json(pedido);
});

app.get("/obras/:id/regras", async (req, res) => {
  res.json(await listarRegras(lerId(req.params.id)));
});

app.put("/obras/:id/regras", async (req, res) => {
  res.json(await salvarRegras(lerId(req.params.id), req.body.faixas));
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