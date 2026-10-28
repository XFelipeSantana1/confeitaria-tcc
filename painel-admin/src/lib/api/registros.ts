// Trilha de auditoria: histórico do que o gestor mudou no painel.

import type { Registro } from "../../types";
import { requisitar } from "./base";

interface RespostaPaginada {
  registros: Array<Record<string, unknown>>;
  total: number;
  limite: number;
  deslocamento: number;
}

/** GET /api/registros?limite=&offset= — mais recentes primeiro. */
export async function listarRegistros(
  token: string,
  limite: number,
  deslocamento: number,
): Promise<{ registros: Registro[]; total: number; limite: number }> {
  const dados = await requisitar<RespostaPaginada>(
    `/registros?limite=${limite}&offset=${deslocamento}`,
    token,
  );
  return {
    registros: dados.registros.map((linha) => ({
      id: Number(linha.id),
      usuario_nome: String(linha.usuario_nome ?? ""),
      acao: String(linha.acao ?? "") as Registro["acao"],
      registro_id: linha.registro_id === null ? null : Number(linha.registro_id),
      descricao: String(linha.descricao ?? ""),
      antes: (linha.antes ?? null) as Record<string, unknown> | null,
      depois: (linha.depois ?? null) as Record<string, unknown> | null,
      // O MySQL devolve "2026-09-28 14:30:00.123"; o "T" e o "Z" evitam que o
      // navegador interprete como hora local e mostre a hora errada.
      criado_em: String(linha.criado_em ?? "").replace(" ", "T") + "Z",
    })),
    total: Number(dados.total) || 0,
    limite: Number(dados.limite) || limite,
  };
}
