// Formatação de valores em Real. Arquivo separado porque formatação é
// regra de apresentação reutilizável (card, sacola, WhatsApp) e testável.

const formatoReal = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarMoeda(valor: number): string {
  return formatoReal.format(Number(valor) || 0);
}
