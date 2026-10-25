import { prisma } from "../lib/prisma";
import { ErroDeNegocio } from "../erros";
import { escolherFaixa } from "./alcada";

const UNIDADES = ["un", "kg", "m", "m²", "h"];

type ItemEntrada = {
  descricao: string;
  quantidade: number;
  unidade: string;
  precoUnitarioCentavos: number;
};

type PedidoEntrada = {
  idObra: number;
  idFornecedor: number;
  observacoes?: string;
  itens: ItemEntrada[];
};

export async function criarPedido(dados: PedidoEntrada) {
  // 1. valida os itens
  if (!dados.itens || dados.itens.length === 0) {
    throw new ErroDeNegocio("O pedido precisa ter pelo menos um item.");
  }

  for (const item of dados.itens) {
    if (!item.descricao?.trim()) {
      throw new ErroDeNegocio("Todo item precisa de uma descrição.");
    }
    if (!Number.isFinite(item.quantidade) || item.quantidade <= 0) {
      throw new ErroDeNegocio("A quantidade de cada item deve ser maior que zero.");
    }
    if (!Number.isInteger(item.precoUnitarioCentavos) || item.precoUnitarioCentavos <= 0) {
      throw new ErroDeNegocio("O preço de cada item deve ser maior que zero.");
    }
    if (!UNIDADES.includes(item.unidade)) {
      throw new ErroDeNegocio(`Unidade inválida: ${item.unidade}`);
    }
  }

  // 2. calcula o total de cada item e do pedido. Quem calcula é o back, não o front
  const itens = dados.itens.map((item) => ({
    descricao: item.descricao.trim(),
    quantidade: item.quantidade,
    unidade: item.unidade,
    precoUnitarioCentavos: item.precoUnitarioCentavos,
    totalCentavos: Math.round(item.quantidade * item.precoUnitarioCentavos),
  }));

  const totalCentavos = itens.reduce((soma, item) => soma + item.totalCentavos, 0);

  // 3. confere se a obra e o fornecedor existem, e escolhe a faixa
  const obra = await prisma.obra.findUnique({
    where: { idObra: dados.idObra },
    include: { regras: true },
  });
  if (!obra) {
    throw new ErroDeNegocio("Obra não encontrada.");
  }

  const fornecedor = await prisma.fornecedor.findUnique({
    where: { idFornecedor: dados.idFornecedor },
  });
  if (!fornecedor) {
    throw new ErroDeNegocio("Fornecedor não encontrado.");
  }

  const faixa = escolherFaixa(obra.regras, totalCentavos);
  if (!faixa) {
    throw new ErroDeNegocio(
      "Nenhuma regra de alçada desta obra cobre esse valor. Ajuste as regras antes de criar o pedido."
    );
  }

  const aprovadores = await prisma.regraAprovador.findMany({
    where: { idRegra: faixa.idRegra },
    orderBy: { ordem: "asc" },
  });
  if (aprovadores.length === 0) {
    throw new ErroDeNegocio("A faixa escolhida não tem aprovadores cadastrados.");
  }

  // 4. cria o pedido com os itens e a fila de aprovação copiada da regra, tudo de uma vez
  return prisma.pedido.create({
    data: {
      idObra: obra.idObra,
      idFornecedor: fornecedor.idFornecedor,
      observacoes: dados.observacoes?.trim() || null,
      totalCentavos,
      status: "PENDENTE",
      etapaAtual: 1,
      itens: { create: itens },
      etapas: {
        create: aprovadores.map((aprovador, indice) => ({
          idUsuario: aprovador.idUsuario,
          ordem: indice + 1,
        })),
      },
    },
    include: { itens: true, etapas: true },
  });
}