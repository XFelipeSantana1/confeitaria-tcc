// Insumos: CRUD e movimentação de estoque (entrada/perda/ajuste).

import type { Insumo } from "../../types";
import { requisitar } from "./base";

/** POST /api/insumos — cadastro (estoque inicial vai junto). */
export async function criarInsumo(
  token: string,
  dados: {
    nome: string;
    unidade_medida: string;
    quantidade_atual: number;
    quantidade_minima: number;
    custo_unitario: number;
  },
): Promise<{ id: number }> {
  return requisitar<{ id: number }>("/insumos", token, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

/** PUT /api/insumos/:id — edição parcial (estoque NÃO entra aqui). */
export async function atualizarInsumo(
  token: string,
  id: number,
  dados: {
    nome?: string;
    unidade_medida?: string;
    quantidade_minima?: number;
    custo_unitario?: number;
  },
): Promise<void> {
  await requisitar(`/insumos/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

/** DELETE /api/insumos/:id — 409 se tem receita/movimentação vinculada. */
export async function removerInsumo(token: string, id: number): Promise<void> {
  await requisitar(`/insumos/${id}`, token, { method: "DELETE" });
}

/** POST /api/insumos/:id/movimentar — entrada/perda/ajuste auditado. */
export async function movimentarInsumo(
  token: string,
  id: number,
  dados: { tipo: string; quantidade: number; observacao?: string },
): Promise<void> {
  await requisitar(`/insumos/${id}/movimentar`, token, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

/** GET /api/insumos — lista completa para a tabela. */
export async function listarInsumos(token: string): Promise<Insumo[]> {
  const lista = await requisitar<Array<Record<string, unknown>>>("/insumos", token);
  return lista.map((insumo) => ({
    id: Number(insumo.id),
    nome: String(insumo.nome ?? ""),
    unidade_medida: String(insumo.unidade_medida ?? ""),
    quantidade_atual: Number(insumo.quantidade_atual) || 0,
    quantidade_minima: Number(insumo.quantidade_minima) || 0,
    custo_unitario: Number(insumo.custo_unitario) || 0,
  }));
}
