import pool from "../config/db.js";
import type { RowDataPacket } from "mysql2";
import { registrar } from "./registroService.js";
import type { RequisicaoAutenticada } from "../middleware/auth.js";

// Auditoria de produto em um arquivo só, para não inflar o controller (que já
// carrega a transação da ficha técnica). A regra que importa aqui:
//
// o painel edita por COALESCE, então o corpo da requisição NÃO é o estado
// final. "preço: 9" no corpo pode significar "virou 9" ou "não mandou preço".
// Comparar corpo com banco produziria log mentiroso. Por isso lê o registro
// ANTES, aplica mentalmente só os campos enviados, e compara com o depois.

interface ProdutoAuditado extends RowDataPacket {
  nome: string;
  descricao: string | null;
  preco: string;
  ativo: number;
  imagem_url: string | null;
  categoria_nome: string | null;
}

// Só os campos que o gestor edita. `preco` entra como string porque o MySQL
// devolve DECIMAL como texto — comparar "9.00" com 9 daria diferença falsa.
const CAMPOS_AUDITADOS = [
  "nome",
  "descricao",
  "preco",
  "ativo",
  "imagem_url",
  "categoria_nome",
] as const;

type CampoAuditado = (typeof CAMPOS_AUDITADOS)[number];

async function lerProduto(id: number): Promise<ProdutoAuditado | null> {
  const [linhas] = await pool.query<ProdutoAuditado[]>(
    `SELECT p.nome, p.descricao, p.preco, p.ativo, p.imagem_url,
            c.nome AS categoria_nome
       FROM produtos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
      WHERE p.id = ?`,
    [id]
  );
  return linhas[0] ?? null;
}

function mesmoValor(antes: unknown, depois: unknown): boolean {
  return String(antes ?? "") === String(depois ?? "");
}

// Monta "preço: R$ 8,50 → R$ 10,00" só com o que mudou de fato. Registrar o
// produto inteiro a cada save polui o log e esconde a mudança importante.
function descreverMudancas(
  antes: ProdutoAuditado,
  depois: ProdutoAuditado,
): Array<{ campo: CampoAuditado; de: unknown; para: unknown }> {
  const mudancas: Array<{ campo: CampoAuditado; de: unknown; para: unknown }> = [];
  for (const campo of CAMPOS_AUDITADOS) {
    if (!mesmoValor(antes[campo], depois[campo])) {
      mudancas.push({ campo, de: antes[campo], para: depois[campo] });
    }
  }
  return mudancas;
}

export async function auditarCriacao(
  req: RequisicaoAutenticada,
  id: number,
  nome: string,
): Promise<void> {
  await registrar(req, {
    acao: "criar",
    tabela: "produtos",
    registroId: id,
    descricao: `Cadastrou o produto "${nome}"`,
    depois: { nome },
  });
}

// O "antes" precisa ser lido ANTES do UPDATE — por isso o controller chama
// esta função antes de gravar e passa o resultado para `auditarAtualizacao`.
// Reler depois daria o estado novo nos dois lados e o log não diria nada.
export async function prepararAtualizacao(id: number): Promise<ProdutoAuditado | null> {
  return lerProduto(id);
}

export async function auditarAtualizacao(
  req: RequisicaoAutenticada,
  id: number,
  antes: ProdutoAuditado | null,
): Promise<void> {
  if (antes === null) return; // produto inexistente: a rota já devolveu 404
  const depois = await lerProduto(id);
  if (depois === null) return;

  const mudancas = descreverMudancas(antes, depois);
  if (mudancas.length === 0) return; // save sem mudança não é evento

  const resumo = mudancas
    .map((mudanca) => `${rotular(mudanca.campo)}: ${texto(mudanca.de)} → ${texto(mudanca.para)}`)
    .join(", ");

  await registrar(req, {
    acao: "atualizar",
    tabela: "produtos",
    registroId: id,
    descricao: `Editou "${depois.nome}" (${resumo})`,
    antes: Object.fromEntries(mudancas.map((m) => [m.campo, m.de])),
    depois: Object.fromEntries(mudancas.map((m) => [m.campo, m.para])),
  });
}

export async function auditarExclusao(
  req: RequisicaoAutenticada,
  id: number,
  nome: string,
): Promise<void> {
  await registrar(req, {
    acao: "excluir",
    tabela: "produtos",
    registroId: id,
    descricao: `Excluiu o produto "${nome}"`,
    antes: { nome },
  });
}

const ROTULOS: Record<CampoAuditado, string> = {
  nome: "nome",
  descricao: "descrição",
  preco: "preço",
  ativo: "visibilidade",
  imagem_url: "foto",
  categoria_nome: "categoria",
};

function rotular(campo: CampoAuditado): string {
  return ROTULOS[campo];
}

// "ativo" é boolean no MySQL e vira 0/1; mostrar "0 → 1" não diz nada.
function texto(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "(vazio)";
  if (valor === 1 || valor === true) return "visível";
  if (valor === 0 || valor === false) return "oculto";
  if (typeof valor === "string" && Number.isFinite(Number(valor))) {
    return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
  }
  return String(valor);
}
