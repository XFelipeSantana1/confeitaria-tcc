import pool from "../config/db.js";
import type { RowDataPacket } from "mysql2";
import { registrar } from "../services/registroService.js";
import type { RequisicaoAutenticada } from "../middleware/auth.js";

// Exportada porque o controller precisa do mesmo SELECT antes do UPDATE.
export interface LinhaInsumo extends RowDataPacket {
  nome: string;
  unidade_medida: string;
  quantidade_minima: string;
  custo_unitario: string;
}

async function lerInsumo(id: number): Promise<LinhaInsumo | null> {
  const [linhas] = await pool.query<LinhaInsumo[]>(
    "SELECT nome, unidade_medida, quantidade_minima, custo_unitario FROM insumos WHERE id = ?",
    [id]
  );
  return linhas[0] ?? null;
}

// O painel manda só os campos editados (COALESCE no SQL), então o log precisa
// ler a linha ANTES do UPDATE. Comparar o corpo da requisição com a tabela
// escreveria "custo: 3,50 → 3,50" em todo save que não mexeu no custo.
export async function auditarAtualizacaoInsumo(
  req: RequisicaoAutenticada,
  id: number,
  antes: LinhaInsumo | null,
): Promise<void> {
  if (antes === null) return;
  const depois = await lerInsumo(id);
  if (depois === null) return;

  const rotulos: Record<keyof LinhaInsumo, string> = {
    nome: "nome",
    unidade_medida: "unidade",
    quantidade_minima: "estoque mínimo",
    custo_unitario: "custo unitário",
  };

  const mudancas: Array<{ campo: string; de: unknown; para: unknown }> = [];
  for (const campo of Object.keys(rotulos) as Array<keyof LinhaInsumo>) {
    if (String(antes[campo]) !== String(depois[campo])) {
      mudancas.push({ campo: rotulos[campo], de: antes[campo], para: depois[campo] });
    }
  }
  if (mudancas.length === 0) return;

  const resumo = mudancas
    .map((mudanca) => `${mudanca.campo}: ${String(mudanca.de)} → ${String(mudanca.para)}`)
    .join(", ");

  await registrar(req, {
    acao: "atualizar",
    tabela: "insumos",
    registroId: id,
    descricao: `Editou o insumo "${depois.nome}" (${resumo})`,
    antes: Object.fromEntries(mudancas.map((m) => [m.campo, m.de])),
    depois: Object.fromEntries(mudancas.map((m) => [m.campo, m.para])),
  });
}

export async function auditarCriacaoInsumo(
  req: RequisicaoAutenticada,
  id: number,
  nome: string,
): Promise<void> {
  await registrar(req, {
    acao: "criar",
    tabela: "insumos",
    registroId: id,
    descricao: `Cadastrou o insumo "${nome}"`,
    depois: { nome },
  });
}

export async function auditarExclusaoInsumo(
  req: RequisicaoAutenticada,
  id: number,
  nome: string,
): Promise<void> {
  await registrar(req, {
    acao: "excluir",
    tabela: "insumos",
    registroId: id,
    descricao: `Excluiu o insumo "${nome}"`,
    antes: { nome },
  });
}

// Movimentação de estoque vira registro porque é a alteração que mais importa
// numa confeitaria: foi ela que zerou o chocolate. A movimentação contábil já
// existe (movimentacoes_estoque); este registro liga a operação à pessoa.
export async function auditarMovimentacao(
  req: RequisicaoAutenticada,
  id: number,
  nome: string,
  tipo: string,
  quantidade: number,
  saldoDepois: number,
  unidade: string,
): Promise<void> {
  const rotulos: Record<string, string> = {
    entrada: "entrada de",
    ajuste: "ajuste em",
    perda: "perda de",
  };
  const texto = `${rotulos[tipo] ?? tipo} ${quantidade}${unidade}`;

  await registrar(req, {
    acao: "mover",
    tabela: "insumos",
    registroId: id,
    descricao: `Registrou ${texto} em "${nome}" (saldo ${saldoDepois}${unidade})`,
    antes: { saldo: saldoDepois - (tipo === "entrada" ? quantidade : -quantidade) },
    depois: { saldo: saldoDepois },
  });
}
