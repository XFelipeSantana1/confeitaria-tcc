import pool from "../config/db.js";
import { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { ehDuplicado, ehReferenciaInvalida, temCodigo } from "../lib/erros.js";
import {
  auditarAtualizacao,
  auditarCriacao,
  auditarExclusao,
  prepararAtualizacao,
} from "../services/produtoAuditoria.js";
import type { RequisicaoAutenticada } from "../middleware/auth.js";

/** Um item de ficha técnica já validado. */
interface ItemFicha {
  insumo_id: number;
  quantidade_necessaria: number;
}

// Limites espelhados do schema. Sem checar aqui, um nome de 200 caracteres
// chega ao MySQL e volta como ER_DATA_TOO_LONG: 500 com "erro interno" para o
// que é problema de formulário.
const LIMITE = { nome: 120, descricao: 500, imagemUrl: 255 } as const;

/** Só o que a consulta precisa para provar que o produto existe. */
interface LinhaId extends RowDataPacket {
  id: number;
}

interface LinhaNome extends RowDataPacket {
  nome: string;
}

interface ItemFichaBruta {
  insumo_id?: unknown;
  quantidade_necessaria?: unknown;
}

// Valida a ficha técnica antes de qualquer INSERT: evita 500 de FK com
// mensagem de banco e barra quantidade zerada/negativa na receita.
function fichaValida(ficha_tecnica: unknown): ficha_tecnica is ItemFicha[] {
  if (!Array.isArray(ficha_tecnica)) return false;
  return ficha_tecnica.every((bruto: ItemFichaBruta) => {
    if (!bruto || typeof bruto !== "object") return false;
    const insumo = Number(bruto.insumo_id);
    const quantidade = Number(bruto.quantidade_necessaria);
    return (
      Number.isInteger(insumo) &&
      insumo > 0 &&
      Number.isFinite(quantidade) &&
      quantidade > 0
    );
  });
}

// O mesmo insumo duas vezes na receita viola a PK (produto_id, insumo_id).
// Sem este caso a tela recebia 500 "erro interno" — e o painel chegou a dizer
// que o backend barrava, então a pessoa achava que era erro de dedo.
function respostaDuplicado(erro: unknown, res: Response): boolean {
  if (!ehDuplicado(erro)) return false;
  res.status(400).json({
    erro: "O mesmo insumo aparece duas vezes na ficha técnica. Some uma das linhas.",
  });
  return true;
}

/** Valida nome/preço/descrição/URL. Devolve a mensagem de erro, ou null. */
function erroNosCampos(campos: {
  nome?: unknown;
  preco?: unknown;
  descricao?: unknown;
  imagem_url?: unknown;
}): string | null {
  if (campos.nome !== undefined) {
    if (typeof campos.nome !== "string" || campos.nome.trim() === "") {
      return "Nome do produto é obrigatório.";
    }
    if (campos.nome.trim().length > LIMITE.nome) {
      return `O nome pode ter no máximo ${LIMITE.nome} caracteres.`;
    }
  }
  if (campos.preco !== undefined && campos.preco !== null) {
    const preco = Number(campos.preco);
    if (!Number.isFinite(preco) || preco <= 0) {
      return "Preço deve ser maior que zero.";
    }
  }
  if (typeof campos.descricao === "string" && campos.descricao.length > LIMITE.descricao) {
    return `A descrição pode ter no máximo ${LIMITE.descricao} caracteres.`;
  }
  if (typeof campos.imagem_url === "string" && campos.imagem_url.length > LIMITE.imagemUrl) {
    return "O caminho da imagem é longo demais.";
  }
  return null;
}

// Traduz violação de FK em resposta de negócio (404 do dono do vínculo).
function respostaFk(err: unknown, res: Response): boolean {
  if (!ehReferenciaInvalida(err)) return false;
  const mensagem: string = (err as { sqlMessage?: string } | null)?.sqlMessage ?? "";
  if (mensagem.includes("fk_produtos_categoria")) {
    res.status(404).json({ erro: "Categoria informada não existe." });
  } else if (mensagem.includes("fk_pi_insumo")) {
    res.status(404).json({ erro: "Um dos insumos da ficha técnica não existe." });
  } else {
    res.status(400).json({ erro: "Referência inválida nos dados enviados." });
  }
  return true;
}

// GET /api/produtos -> vitrine do cliente (só produtos ativos)
export async function listarPublico(req: Request, res: Response) {
  const [rows] = await pool.query(
    `SELECT p.id, p.nome, p.descricao, p.preco, p.imagem_url, c.nome AS categoria
     FROM produtos p
     LEFT JOIN categorias c ON c.id = p.categoria_id
     WHERE p.ativo = TRUE
     ORDER BY c.nome, p.nome`
  );
  res.json(rows);
}

// GET /api/produtos/admin/todos -> painel (inclui inativos)
export async function listarTodos(req: Request, res: Response) {
  const [rows] = await pool.query(
    `SELECT p.*, c.nome AS categoria
     FROM produtos p
     LEFT JOIN categorias c ON c.id = p.categoria_id
     ORDER BY p.nome`
  );
  res.json(rows);
}

// GET /api/produtos/admin/:id -> painel (COM ficha técnica para edição).
export async function buscarPorIdAdmin(req: Request, res: Response) {
  const id = Number(req.params.id);

  const [produtoRows] = await pool.query<RowDataPacket[]>("SELECT * FROM produtos WHERE id = ?", [id]);
  if (!produtoRows[0]) return res.status(404).json({ erro: "Produto não encontrado." });

  const [insumos] = await pool.query(
    `SELECT i.id, i.nome, i.unidade_medida, pi.quantidade_necessaria
     FROM produto_insumo pi
     JOIN insumos i ON i.id = pi.insumo_id
     WHERE pi.produto_id = ?`,
    [id]
  );

  res.json({ ...produtoRows[0], ficha_tecnica: insumos });
}

// POST /api/produtos
// Body: { nome, descricao, preco, categoria_id, imagem_url,
//         ficha_tecnica: [{ insumo_id, quantidade_necessaria }] }
export async function criar(req: RequisicaoAutenticada, res: Response) {
  const { nome, descricao, preco, categoria_id, imagem_url, ficha_tecnica } = req.body;
  if (!nome || preco == null) {
    return res.status(400).json({ erro: "Nome e preço são obrigatórios." });
  }
  const erroDosCampos = erroNosCampos({ nome, preco, descricao, imagem_url });
  if (erroDosCampos) {
    return res.status(400).json({ erro: erroDosCampos });
  }
  if (ficha_tecnica !== undefined && !fichaValida(ficha_tecnica)) {
    return res.status(400).json({ erro: "Ficha técnica inválida: cada item precisa de insumo_id e quantidade_necessaria maiores que zero." });
  }

  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();

    const [result] = await conexao.query<ResultSetHeader>(
      `INSERT INTO produtos (nome, descricao, preco, categoria_id, imagem_url)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, descricao || null, preco, categoria_id || null, imagem_url || null]
    );
    const produtoId = result.insertId;

    if (Array.isArray(ficha_tecnica) && ficha_tecnica.length > 0) {
      const valores = ficha_tecnica.map((item) => [produtoId, item.insumo_id, item.quantidade_necessaria]);
      await conexao.query(
        "INSERT INTO produto_insumo (produto_id, insumo_id, quantidade_necessaria) VALUES ?",
        [valores]
      );
    }

    await conexao.commit();
    // Auditoria depois do commit: se falhasse antes, o produto existiria sem
    // registro. O inverso (log sem produto) é bem menos grave.
    await auditarCriacao(req, produtoId, nome);
    res.status(201).json({ id: produtoId, nome });
  } catch (err) {
    await conexao.rollback();
    if (respostaFk(err, res)) return;
    if (respostaDuplicado(err, res)) return;
    throw err;
  } finally {
    conexao.release();
  }
}

// PUT /api/produtos/:id - atualização parcial dos dados básicos
export async function atualizar(req: RequisicaoAutenticada, res: Response) {
  const id = Number(req.params.id);
  const { nome, descricao, preco, categoria_id, imagem_url, ativo } = req.body;

  // O PUT é parcial (COALESCE), então só se valida o que veio preenchido.
  // Sem isto dava para renomear um produto para "" ou para preço -5 pela API,
  // e o preço negativo aparecia na vitrine.
  const erroDosCampos = erroNosCampos({ nome, preco, descricao, imagem_url });
  if (erroDosCampos) {
    return res.status(400).json({ erro: erroDosCampos });
  }
  if (ativo !== undefined && typeof ativo !== "boolean" && ativo !== 0 && ativo !== 1) {
    return res.status(400).json({ erro: "Valor de 'ativo' inválido." });
  }

  // Lido antes do UPDATE para o log poder dizer o que era e o que virou.
  const antes = await prepararAtualizacao(id);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE produtos SET
       nome = COALESCE(?, nome),
       descricao = COALESCE(?, descricao),
       preco = COALESCE(?, preco),
       categoria_id = COALESCE(?, categoria_id),
       imagem_url = COALESCE(?, imagem_url),
       ativo = COALESCE(?, ativo)
     WHERE id = ?`,
    [nome ?? null, descricao ?? null, preco ?? null, categoria_id ?? null, imagem_url ?? null, ativo ?? null, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }
  await auditarAtualizacao(req, id, antes);
  res.json({ mensagem: "Produto atualizado com sucesso." });
}

// PUT /api/produtos/:id/ficha-tecnica - substitui a receita inteira.
// Primeiro confirma que o produto existe (antes respondia 200 em id fantasma).
export async function atualizarFichaTecnica(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { ficha_tecnica } = req.body;

  if (ficha_tecnica !== undefined && !fichaValida(ficha_tecnica)) {
    return res.status(400).json({ erro: "Ficha técnica inválida: cada item precisa de insumo_id e quantidade_necessaria maiores que zero." });
  }

  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();

    const [produtoRows] = await conexao.query<LinhaId[]>("SELECT id FROM produtos WHERE id = ?", [id]);
    if (!produtoRows[0]) {
      await conexao.rollback();
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    await conexao.query("DELETE FROM produto_insumo WHERE produto_id = ?", [id]);

    if (Array.isArray(ficha_tecnica) && ficha_tecnica.length > 0) {
      const valores = ficha_tecnica.map((item) => [id, item.insumo_id, item.quantidade_necessaria]);
      await conexao.query(
        "INSERT INTO produto_insumo (produto_id, insumo_id, quantidade_necessaria) VALUES ?",
        [valores]
      );
    }

    await conexao.commit();
    res.json({ mensagem: "Ficha técnica atualizada." });
  } catch (err) {
    await conexao.rollback();
    if (respostaFk(err, res)) return;
    if (respostaDuplicado(err, res)) return;
    throw err;
  } finally {
    conexao.release();
  }
}

// GET /api/produtos/admin/mais-vendidos -> dashboard do painel
export async function maisVendidos(req: Request, res: Response) {
  const [rows] = await pool.query(
    `SELECT p.id, p.nome, SUM(ip.quantidade) AS total_vendido
     FROM itens_pedido ip
     JOIN produtos p ON p.id = ip.produto_id
     JOIN pedidos pe ON pe.id = ip.pedido_id
     WHERE pe.status != 'cancelado'
     GROUP BY p.id
     ORDER BY total_vendido DESC
     LIMIT 10`
  );
  res.json(rows);
}

export async function remover(req: RequisicaoAutenticada, res: Response) {
  const id = Number(req.params.id);
  try {
    // Nome lido antes: some com a linha no DELETE, e um log dizendo "excluiu o
    // produto 3" não ajuda o gestor a lembrar o que era.
    const [antes] = await pool.query<LinhaNome[]>("SELECT nome FROM produtos WHERE id = ?", [id]);
    const nome = antes[0]?.nome;

    const [result] = await pool.query<ResultSetHeader>("DELETE FROM produtos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }
    if (nome) {
      await auditarExclusao(req, id, nome);
    }
    res.status(204).send();
  } catch (erro: unknown) {
    // Tem itens de pedido vinculados: 409 explicando, não 500.
    if (temCodigo(erro, "ER_ROW_IS_REFERENCED_2")) {
      return res.status(409).json({ erro: "Produto possui vendas vinculadas e não pode ser removido." });
    }
    throw erro;
  }
}
