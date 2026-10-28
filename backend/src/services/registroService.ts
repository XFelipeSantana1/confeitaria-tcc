import pool from "../config/db.js";
import type { RowDataPacket } from "mysql2";
import type { RequisicaoAutenticada } from "../middleware/auth.js";

// Trilha de auditoria. Tudo que muda no painel passa por aqui.
//
// Por que existe: o gestor precisa responder "quem desativou esse doce?" e
// "qual era o preço antes?". O painel edita por COALESCE (campo omitido mantém
// o anterior), então guardar só o valor novo não permitiria reconstruir a
// mudança — por isso o ANTIGO e o NOVO em JSON.
//
// Por que não apaga nada: é registro de leitura, jamais de escrita. Falha ao
// gravar não pode derrubar a operação que o gestor acabou de fazer.

// Só o que o painel de fato grava. "entrar"/"sair" foram previstos para um
// registro de login que não existe — mantê-los no enum do TypeScript faria o
// tipo prometer algo que nenhuma rota produz.
export type AcaoRegistro = "criar" | "atualizar" | "excluir" | "mover";

/** Largura da coluna `descricao`. Ver truncamento em `registrar`. */
const LIMITE_DESCRICAO = 255;

interface DadosRegistro {
  acao: AcaoRegistro;
  tabela: string;
  registroId?: number | null;
  descricao: string;
  antes?: unknown;
  depois?: unknown;
}

/**
 * Corta no limite da coluna. Sem isto, um nome de 120 caracteres renomeado
 * gerava "Renomeou a categoria "AAA…" para "BBB…"", que passa de 255 — e o
 * MySQL devolvia ER_DATA_TOO_LONG. Como o catch abaixo engole o erro, o
 * gestor perdia a renomeação no histórico sem nenhuma pista do porquê.
 */
function descricaoSegura(texto: string): string {
  if (texto.length <= LIMITE_DESCRICAO) return texto;
  return `${texto.slice(0, LIMITE_DESCRICAO - 1)}…`;
}

// Aceita null para não gravar o vínculo com o usuário (operações de sistema),
// mas exige o nome: o log precisa continuar legível se o usuário for apagado.
function nomeDoUsuario(req: RequisicaoAutenticada): string {
  return req.usuario?.nome?.trim() || "Sistema";
}

export async function registrar(
  req: RequisicaoAutenticada,
  dados: DadosRegistro,
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO registros
         (usuario_id, usuario_nome, acao, tabela, registro_id, descricao, antes, depois)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.usuario?.id ?? null,
        nomeDoUsuario(req),
        dados.acao,
        dados.tabela,
        dados.registroId ?? null,
        descricaoSegura(dados.descricao),
        dados.antes ? JSON.stringify(dados.antes) : null,
        dados.depois ? JSON.stringify(dados.depois) : null,
      ],
    );
  } catch (erro) {
    // Log de auditoria é efeito colateral: falhar aqui não pode cancelar a
    // operação do gestor, só fazer o registro sumir.
    console.error("Falha ao gravar registro de auditoria:", erro);
  }
}

// Lista paginada. O limite é fixo e sempre acompanhado de OFFSET porque a
// tabela só cresce; sem isso, a tela de log vira gargalo na hora que a loja
// tiver muitos registros.
export interface LinhaRegistro extends RowDataPacket {
  id: number;
  usuario_nome: string;
  acao: AcaoRegistro;
  tabela: string;
  registro_id: number | null;
  descricao: string;
  antes: unknown;
  depois: unknown;
  criado_em: string;
}

export async function listar(
  limite: number,
  deslocamento: number,
): Promise<LinhaRegistro[]> {
  const [rows] = await pool.query<LinhaRegistro[]>(
    `SELECT id, usuario_nome, acao, tabela, registro_id, descricao,
            antes, depois, criado_em
       FROM registros
      ORDER BY criado_em DESC, id DESC
      LIMIT ? OFFSET ?`,
    [limite, deslocamento],
  );
  return rows;
}

export async function contar(): Promise<number> {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM registros");
  const linha = rows as Array<{ total: number | string }>;
  return Number(linha[0]?.total ?? 0);
}
