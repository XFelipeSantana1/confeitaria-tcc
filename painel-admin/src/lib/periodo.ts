import { useMemo, useState } from "react";
import type { Pedido } from "../types";
import { formatarMoeda } from "../lib/formatarMoeda";

/**
 * Período do Resumo.
 *
 * `tudo` é o padrão de propósito: o painel já abria mostrando o estado real da
 * loja, e começar filtrando escondia pedido de ontem que ninguém entregou. O
 * filtro existe para responder perguntas ("quanto entrou hoje?"), não para
 * esconder a fila.
 */
export type Periodo = "hoje" | "7dias" | "30dias" | "tudo";

export const PERIODOS: { valor: Periodo; rotulo: string }[] = [
  { valor: "hoje", rotulo: "Hoje" },
  { valor: "7dias", rotulo: "7 dias" },
  { valor: "30dias", rotulo: "30 dias" },
  { valor: "tudo", rotulo: "Tudo" },
];

const DIAS: Record<Exclude<Periodo, "tudo">, number> = {
  hoje: 1,
  "7dias": 7,
  "30dias": 30,
};

/** Início do período em milissegundos. `tudo` devolve 0 (sem corte). */
export function inicioDoPeriodo(periodo: Periodo, agora = new Date()): number {
  if (periodo === "tudo") return 0;
  const dias = DIAS[periodo];
  const inicio = new Date(agora);
  inicio.setHours(0, 0, 0, 0);
  if (periodo === "hoje") return inicio.getTime();
  inicio.setDate(inicio.getDate() - (dias - 1));
  return inicio.getTime();
}

/** Pedidos dentro do período. Cancelado nunca entra em valor nem em gráfico. */
export function pedidosDoPeriodo(pedidos: Pedido[], periodo: Periodo): Pedido[] {
  const inicio = inicioDoPeriodo(periodo);
  if (inicio === 0) return pedidos;
  return pedidos.filter((pedido) => new Date(pedido.criado_em).getTime() >= inicio);
}

export interface DiaVendido {
  /** "2026-10-05" */
  chave: string;
  rotulo: string;
  total: number;
  quantidade: number;
}

/**
 * Vendas por dia, agrupadas no cliente.
 *
 * Sem biblioteca de gráfico: o `ListaMaisVendidos` já faz barra por CSS, e
 * um segundo gráfico com SVG à mão só custaria manutenção. A barra é
 * proporcional ao maior dia do período, então o desenho lê a proporção
 * sem depender de eixo nem de legenda.
 */
export function vendasPorDia(pedidos: Pedido[], periodo: Periodo): DiaVendido[] {
  const noPeriodo = pedidosDoPeriodo(pedidos, periodo).filter(
    (pedido) => pedido.status !== "cancelado",
  );

  if (periodo === "tudo") {
    // "Tudo" pode spansar meses: mostrar 400 barras não informa nada. Fica nos
    // últimos 14 dias com venda, que é o que dá para ler.
    return ultimosDias(noPeriodo, 14);
  }

  const dias = DIAS[periodo];
  const mapa = new Map<string, { total: number; quantidade: number }>();
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  for (let i = dias - 1; i >= 0; i -= 1) {
    const dia = new Date(hoje);
    dia.setDate(dia.getDate() - i);
    mapa.set(chaveDe(dia), { total: 0, quantidade: 0 });
  }

  for (const pedido of noPeriodo) {
    const chave = chaveDe(new Date(pedido.criado_em));
    const existente = mapa.get(chave);
    if (!existente) continue;
    existente.total += pedido.valor_total;
    existente.quantidade += 1;
  }

  return [...mapa.entries()].map(([chave, valor]) => ({
    chave,
    rotulo: rotuloDe(chave),
    ...valor,
  }));
}

/** Últimos N dias que tiveram venda, do mais antigo para o mais novo. */
function ultimosDias(pedidos: Pedido[], quantos: number): DiaVendido[] {
  const porDia = new Map<string, { total: number; quantidade: number }>();
  for (const pedido of pedidos) {
    const chave = chaveDe(new Date(pedido.criado_em));
    const existente = porDia.get(chave) ?? { total: 0, quantidade: 0 };
    existente.total += pedido.valor_total;
    existente.quantidade += 1;
    porDia.set(chave, existente);
  }
  return [...porDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-quantos)
    .map(([chave, valor]) => ({ chave, rotulo: rotuloDe(chave), ...valor }));
}

function chaveDe(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

function rotuloDe(chave: string): string {
  const [ano, mes, dia] = chave.split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

/** O estado do filtro, com o setter e os botões prontos. */
export function usePeriodo(): [Periodo, (periodo: Periodo) => void] {
  const [periodo, definirPeriodo] = useState<Periodo>("tudo");
  return useMemo(() => [periodo, definirPeriodo] as const, [periodo]);
}

export { formatarMoeda };
