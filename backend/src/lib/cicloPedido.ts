/**
 * Ciclo de vida do pedido, em um lugar só.
 *
 * A regra precisa estar aqui e não na tela: o painel escondia o botão de
 * cancelar em pedido entregue, mas a API aceitava — qualquer outra chamada
 * (curl, teste, outro cliente) devolvia o estoque de uma mercadoria que já
 * tinha saído. A tela nunca é o lugar de decidir regra que vale para todos.
 */

/** Para onde cada status pode ir. Cancelar é sempre permitido de 3 estados. */
const TRANSICOES: Record<string, string[]> = {
  pendente: ["em_preparo", "pronto", "cancelado"],
  em_preparo: ["pronto", "cancelado"],
  pronto: ["entregue", "cancelado"],
  entregue: [],
  cancelado: [],
};

/** Estados sem volta: a mercadoria já saiu (ou já voltou) do estoque. */
const FINAIS = ["entregue", "cancelado"];

export const STATUS_VALIDOS = Object.keys(TRANSICOES);

export function ehStatusValido(status: unknown): status is string {
  return typeof status === "string" && status in TRANSICOES;
}

/** true quando a mudança é permitida pelo fluxo. */
export function podeMudar(deAtual: string, para: string): boolean {
  return (TRANSICOES[deAtual] ?? []).includes(para);
}

/** Estado sem próximo passo — usado para explicar o 409. */
export function ehFinal(status: string): boolean {
  return FINAIS.includes(status);
}

/** Rótulos em português, para a mensagem de erro da API. */
export const ROTULOS: Record<string, string> = {
  pendente: "pendente",
  em_preparo: "em preparo",
  pronto: "pronto",
  entregue: "entregue",
  cancelado: "cancelado",
};

export function rotulo(status: string): string {
  return ROTULOS[status] ?? status;
}