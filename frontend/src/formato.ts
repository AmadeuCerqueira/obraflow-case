const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatarReais = (centavos: number) => moeda.format(centavos / 100);

export const formatarData = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });