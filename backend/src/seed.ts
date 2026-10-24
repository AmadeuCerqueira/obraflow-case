import { prisma } from "./lib/prisma";

async function main() {
  // limpa tudo antes, assim dá pra rodar o seed de novo sem duplicar dados
  await prisma.etapaAprovacao.deleteMany();
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.regraAprovador.deleteMany();
  await prisma.regra.deleteMany();
  await prisma.fornecedor.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.obra.deleteMany();

  const sol = await prisma.obra.create({ data: { nome: "Residencial Sol Nascente" } });
  const mar = await prisma.obra.create({ data: { nome: "Edifício Mar Azul" } });

  const amanda = await prisma.usuario.create({ data: { nome: "Amanda Souza", email: "amanda.souza@example.com" } });
  const joao = await prisma.usuario.create({ data: { nome: "João Lima", email: "joao.lima@example.com" } });
  const carla = await prisma.usuario.create({ data: { nome: "Carla Mendes", email: "carla.mendes@example.com" } });

  const cimentos = await prisma.fornecedor.create({ data: { nome: "Cimentos Bahia", cnpj: "12.345.678/0001-90" } });
  const ferragens = await prisma.fornecedor.create({ data: { nome: "Ferragens Salvador", cnpj: "98.765.432/0001-10" } });

  console.log("Seed concluído!");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());