import pool from "../config/db.js";
import { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { registrar } from "../services/registroService.js";
import { ehDuplicado } from "../lib/erros.js";
import type { RequisicaoAutenticada } from "../middleware/auth.js";

interface LinhaCategoria extends RowDataPacket {
  id?: number;
  nome: string;
}

// Busca uma categoria pelo id e devolve null em vez de array: o chamador
// só precisa saber se existe e qual era o nome, e assim o tipo sai certo sem
// cast espalhado pelo controller.
async function buscarCategoria(id: number): Promise<LinhaCategoria | null> {
  const [linhas] = await pool.query<LinhaCategoria[]>(
    "SELECT nome FROM categorias WHERE id = ?",
    [id]
  );
  return linhas[0] ?? null;
}

export async function listar(req: Request, res: Response) {
  const [rows] = await pool.query<LinhaCategoria[]>("SELECT id, nome FROM categorias ORDER BY nome");
  res.json(rows);
}

export async function criar(req: RequisicaoAutenticada, res: Response) {
  const { nome } = req.body;
  if (!nome) {
    return res.status(400).json({ erro: "Nome é obrigatório." });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO categorias (nome) VALUES (?)",
      [nome]
    );
    // Auditoria depois do INSERT, não antes: se gravar falhar, a categoria já
    // existe e a tela ficaria com dado novo sem registro. O inverso (log sem
    // categoria) seria menos grave que a operação sumir.
    await registrar(req, {
      acao: "criar",
      tabela: "categorias",
      registroId: result.insertId,
      descricao: `Criou a categoria "${nome}"`,
      depois: { nome },
    });
    res.status(201).json({ id: result.insertId, nome });
  } catch (erro: unknown) {
    // Nome é UNIQUE: duplicada vira 409 (mesmo padrão do registrar de usuários).
    if (ehDuplicado(erro)) {
      return res.status(409).json({ erro: "Já existe uma categoria com esse nome." });
    }
    throw erro;
  }
}

export async function atualizar(req: RequisicaoAutenticada, res: Response) {
  const id = Number(req.params.id);
  const { nome } = req.body;

  try {
    // Lê o estado ANTES do UPDATE: é o que o gestor precisa ver no log
    // ("era X, virou Y"). Sem esta leitura, o "antes" seria desconhecido.
    const anterior = await buscarCategoria(id);
    if (anterior === null) {
      return res.status(404).json({ erro: "Categoria não encontrada." });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE categorias SET nome = COALESCE(?, nome) WHERE id = ?",
      [nome ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Categoria não encontrada." });
    }

    const nomeFinal = nome ?? anterior.nome;
    if (nomeFinal !== anterior.nome) {
      await registrar(req, {
        acao: "atualizar",
        tabela: "categorias",
        registroId: id,
        descricao: `Renomeou a categoria "${anterior.nome}" para "${nomeFinal}"`,
        antes: { nome: anterior.nome },
        depois: { nome: nomeFinal },
      });
    }
    res.json({ id, nome: nomeFinal });
  } catch (erro: unknown) {
    if (ehDuplicado(erro)) {
      return res.status(409).json({ erro: "Já existe uma categoria com esse nome." });
    }
    throw erro;
  }
}

export async function remover(req: RequisicaoAutenticada, res: Response) {
  const id = Number(req.params.id);

  // O nome precisa sair do SELECT: a linha some no DELETE, e um log
  // "excluiu a categoria 4" não ajuda ninguém a saber qual era.
  const anterior = await buscarCategoria(id);
  if (anterior === null) {
    return res.status(404).json({ erro: "Categoria não encontrada." });
  }

  const [result] = await pool.query<ResultSetHeader>("DELETE FROM categorias WHERE id = ?", [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ erro: "Categoria não encontrada." });
  }

  await registrar(req, {
    acao: "excluir",
    tabela: "categorias",
    registroId: id,
    descricao: `Excluiu a categoria "${anterior.nome}"`,
    antes: { nome: anterior.nome },
  });
  res.status(204).send();
}