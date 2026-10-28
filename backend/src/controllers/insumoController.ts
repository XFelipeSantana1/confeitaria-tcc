import pool from "../config/db.js";
import { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  auditarAtualizacaoInsumo,
  auditarCriacaoInsumo,
  auditarExclusaoInsumo,
  auditarMovimentacao,
  type LinhaInsumo,
} from "../services/insumoAuditoria.js";
import { temCodigo } from "../lib/erros.js";
import type { RequisicaoAutenticada } from "../middleware/auth.js";

interface LinhaNome extends RowDataPacket {
  nome: string;
}

/** Trava a linha na movimentação: quantidade, nome e unidade de uma vez. */
interface LinhaEstoque extends RowDataPacket {
  quantidade_atual: number | string;
  nome: string;
  unidade_medida: string;
}

export async function listar(req: Request, res: Response) {
  const [rows] = await pool.query("SELECT * FROM insumos ORDER BY nome");
  res.json(rows);
}

export async function listarBaixoEstoque(req: Request, res: Response) {
  const [rows] = await pool.query(
    "SELECT * FROM insumos WHERE quantidade_atual <= quantidade_minima ORDER BY quantidade_atual ASC"
  );
  res.json(rows);
}

const UNIDADES_VALIDAS = ["g", "kg", "ml", "l", "unidade"];

// Larguras do schema. Sem checar, um nome longo demais volta como 500
// "erro interno" — que não ajuda ninguém a descobrir o que é limite de campo.
const LIMITE_NOME = 120;
const LIMITE_OBSERVACAO = 255;

function numeroValido(valor: unknown, permiteZero = true): boolean {
  const numero = Number(valor);
  return Number.isFinite(numero) && (permiteZero ? numero >= 0 : numero > 0);
}

export async function criar(req: RequisicaoAutenticada, res: Response) {
  const { nome, unidade_medida, quantidade_atual, quantidade_minima, custo_unitario } = req.body;

  if (!nome || !unidade_medida || quantidade_atual == null || quantidade_minima == null || custo_unitario == null) {
    return res.status(400).json({ erro: "É necessário preencher todos os campos." });
  }
  if (!UNIDADES_VALIDAS.includes(unidade_medida)) {
    return res.status(400).json({ erro: "Unidade de medida inválida. Use: g, kg, ml, l ou unidade." });
  }
  if (!numeroValido(quantidade_atual) || !numeroValido(quantidade_minima) || !numeroValido(custo_unitario)) {
    return res.status(400).json({ erro: "Quantidades e custo devem ser números maiores ou iguais a zero." });
  }
  if (typeof nome !== "string" || nome.trim().length > LIMITE_NOME) {
    return res.status(400).json({ erro: `O nome pode ter no máximo ${LIMITE_NOME} caracteres.` });
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO insumos (nome, unidade_medida, quantidade_atual, quantidade_minima, custo_unitario)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, unidade_medida, quantidade_atual, quantidade_minima, custo_unitario]
  );

  await auditarCriacaoInsumo(req, result.insertId, nome);
  res.status(201).json({
    id: result.insertId,
    nome,
    unidade_medida,
    quantidade_atual,
    quantidade_minima,
    custo_unitario,
  });
}

// Atualização PARCIAL: só muda os campos que vierem preenchidos no body.
export async function atualizar(req: RequisicaoAutenticada, res: Response) {
  const id = Number(req.params.id);
  const { nome, unidade_medida, quantidade_minima, custo_unitario } = req.body;
  // Propositalmente NÃO inclui quantidade_atual aqui - mexer em estoque
  // é responsabilidade da função "movimentar", não de uma edição de cadastro.
  // O PUT é parcial (COALESCE), então valida só o que veio preenchido.
  // Sem isto dava para renomear um insumo para "" pela API.
  if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
    return res.status(400).json({ erro: "Nome do insumo é obrigatório." });
  }
  if (typeof nome === "string" && nome.trim().length > LIMITE_NOME) {
    return res.status(400).json({ erro: `O nome pode ter no máximo ${LIMITE_NOME} caracteres.` });
  }
  if (unidade_medida !== undefined && unidade_medida !== null && !UNIDADES_VALIDAS.includes(unidade_medida)) {
    return res.status(400).json({ erro: "Unidade de medida inválida. Use: g, kg, ml, l ou unidade." });
  }
  if (
    (quantidade_minima !== undefined && quantidade_minima !== null && !numeroValido(quantidade_minima)) ||
    (custo_unitario !== undefined && custo_unitario !== null && !numeroValido(custo_unitario))
  ) {
    return res.status(400).json({ erro: "Quantidade mínima e custo devem ser números maiores ou iguais a zero." });
  }

  // Lido antes do UPDATE: o painel manda so os campos editados, entao o corpo
  // da requisicao nao e o estado final (ver insumoAuditoria).
  const [antes] = await pool.query<LinhaInsumo[]>(
    "SELECT nome, unidade_medida, quantidade_minima, custo_unitario FROM insumos WHERE id = ?",
    [id]
  );

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE insumos SET
       nome = COALESCE(?, nome),
       unidade_medida = COALESCE(?, unidade_medida),
       quantidade_minima = COALESCE(?, quantidade_minima),
       custo_unitario = COALESCE(?, custo_unitario)
     WHERE id = ?`,
    [nome ?? null, unidade_medida ?? null, quantidade_minima ?? null, custo_unitario ?? null, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ erro: "Insumo não encontrado." });
  }
  await auditarAtualizacaoInsumo(req, id, antes[0] ?? null);
  res.json({ mensagem: "Insumo atualizado com sucesso." });
}

// Entrada soma; ajuste/perda subtraem ('saida' manual continua bloqueada de
// propósito: saída de verdade só acontece via venda, com auditoria do pedido).
// Nunca deixa o estoque negativo nem movimenta insumo inexistente (404).
export async function movimentar(req: RequisicaoAutenticada, res: Response) {
  const id = Number(req.params.id);
  const { tipo, quantidade, observacao } = req.body; // tipo: 'entrada' | 'ajuste' | 'perda'

  if (!["entrada", "ajuste", "perda"].includes(tipo)) {
    return res.status(400).json({ erro: "Tipo inválido para esta rota." });
  }
  // Number() de verdade: string "abc" passava na checagem antiga (NaN não é
  // <= 0) e virava delta NaN no banco.
  const qtd = Number(quantidade);
  if (!Number.isFinite(qtd) || qtd <= 0) {
    return res.status(400).json({ erro: "Quantidade deve ser maior que zero." });
  }
  if (typeof observacao === "string" && observacao.length > LIMITE_OBSERVACAO) {
    return res.status(400).json({
      erro: `A observação pode ter no máximo ${LIMITE_OBSERVACAO} caracteres.`,
    });
  }

  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();

    // Trava a linha: garante 404 se não existe e evita corrida com vendas.
    const [insumoRows] = await conexao.query<LinhaEstoque[]>(
      "SELECT quantidade_atual, nome, unidade_medida FROM insumos WHERE id = ? FOR UPDATE",
      [id]
    );
    if (!insumoRows[0]) {
      await conexao.rollback();
      return res.status(404).json({ erro: "Insumo não encontrado." });
    }
    const atual = Number(insumoRows[0].quantidade_atual);
    const nomeInsumo = String(insumoRows[0].nome);
    const unidade = String(insumoRows[0].unidade_medida);
    if (tipo !== "entrada" && atual < qtd) {
      await conexao.rollback();
      return res.status(409).json({ erro: "Estoque insuficiente para essa baixa." });
    }

    const delta = tipo === "entrada" ? qtd : -qtd;

    await conexao.query(
      "UPDATE insumos SET quantidade_atual = quantidade_atual + ? WHERE id = ?",
      [delta, id]
    );

    await conexao.query(
      `INSERT INTO movimentacoes_estoque (insumo_id, tipo, quantidade, observacao)
       VALUES (?, ?, ?, ?)`,
      [id, tipo, qtd, observacao || null]
    );

    await conexao.commit();
    await auditarMovimentacao(req, id, nomeInsumo, tipo, qtd, atual + delta, unidade);
    res.status(201).json({ mensagem: "Estoque atualizado." });
  } catch (err) {
    await conexao.rollback();
    throw err;
  } finally {
    conexao.release();
  }
}

export async function remover(req: RequisicaoAutenticada, res: Response) {
  const id = Number(req.params.id);
  try {
    // Nome antes do DELETE: a linha some e "insumo 4" nao diz nada depois.
    const [antes] = await pool.query<LinhaNome[]>("SELECT nome FROM insumos WHERE id = ?", [id]);
    const [result] = await pool.query<ResultSetHeader>("DELETE FROM insumos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Insumo não encontrado." });
    }
    if (antes[0]?.nome) {
      await auditarExclusaoInsumo(req, id, String(antes[0].nome));
    }
    res.status(204).send();
  } catch (erro: unknown) {
    // Tem ficha técnica ou movimentação vinculada: 409 explicando, não 500.
    if (temCodigo(erro, "ER_ROW_IS_REFERENCED_2")) {
      return res.status(409).json({ erro: "Insumo possui receitas ou movimentações vinculadas." });
    }
    throw erro;
  }
}
