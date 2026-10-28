/**
 * Data e hora do pedido, em português e no fuso de quem olha.
 *
 * A API manda ISO com `Z` explícito (ver lib/api/pedidos.ts), então converter
 * com `toLocaleString` mostra a hora do Brasil para quem está no Brasil — que é
 * o certo. O cuidado é NÃO usar `new Date(texto).toISOString()`, que voltaria
 * para UTC e mostraria "11:32" para um pedido feito às 14:32.
 */

/** "hoje, 14:32" ou "05 out, 14:32" — o rótulo que o gestor lê primeiro. */
export function formatarQuando(iso: string): string {
  const dia = formatarDia(iso);
  const hora = formatarHora(iso);
  if (dia === "—") return "—";
  return dia === "hoje" ? `hoje, ${hora}` : `${dia}, ${hora}`;
}

/** Só a hora: "14:32" */
export function formatarHora(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "—";
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Só o dia: "05 out" (ou "hoje") */
export function formatarDia(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "—";
  const hoje = new Date();
  if (data.toDateString() === hoje.toDateString()) return "hoje";
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  if (data.toDateString() === ontem.toDateString()) return "ontem";
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/** "05 out, 14:32" */
export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "—";
  return `${formatarDia(iso)}, ${formatarHora(iso)}`;
}
