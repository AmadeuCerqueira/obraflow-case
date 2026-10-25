import type { Regra } from "../generated/prisma/client";

// escolhe a menor faixa em que o total cabe. A faixa sem teto (null) aceita qualquer valor,
// mas só é escolhida se nenhuma outra servir
export function escolherFaixa(faixas: Regra[], totalCentavos: number): Regra | null {
  const faixasQueServem = faixas.filter(
    (faixa) => faixa.valorMaximoCentavos === null || totalCentavos <= faixa.valorMaximoCentavos
  );

  faixasQueServem.sort(
    (a, b) => (a.valorMaximoCentavos ?? Infinity) - (b.valorMaximoCentavos ?? Infinity)
  );

  return faixasQueServem[0] ?? null;
}