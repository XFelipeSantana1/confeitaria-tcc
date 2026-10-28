// Produtos e categorias: CRUD, ficha técnica e ranking de vendas.

import type { Categoria, ItemFicha, ProdutoAdmin } from "../../types";
import { ErroApi, ehVerdadeiro, requisitar, BASE } from "./base";

/** GET /api/produtos/admin/todos — tabela do painel (com inativos). */
export async function listarProdutosAdmin(token: string): Promise<ProdutoAdmin[]> {
  const lista = await requisitar<Array<Record<string, unknown>>>("/produtos/admin/todos", token);
  return lista.map((p) => ({
    id: Number(p.id),
    nome: String(p.nome ?? ""),
    descricao: (p.descricao as string | null) ?? null,
    preco: Number(p.preco) || 0,
    categoria_id: p.categoria_id == null ? null : Number(p.categoria_id),
    categoria: (p.categoria as string | null) ?? null,
    imagem_url: (p.imagem_url as string | null) ?? null,
    ativo: ehVerdadeiro(p.ativo),
  }));
}

/** GET /api/produtos/admin/:id — produto + ficha para edição. */
export async function obterProdutoAdmin(
  token: string,
  id: number,
): Promise<{ produto: ProdutoAdmin; ficha: ItemFicha[] }> {
  const dados = await requisitar<Record<string, unknown>>(`/produtos/admin/${id}`, token);
  const bruta = (dados.ficha_tecnica as Array<Record<string, unknown>>) ?? [];
  return {
    produto: {
      id: Number(dados.id),
      nome: String(dados.nome ?? ""),
      descricao: (dados.descricao as string | null) ?? null,
      preco: Number(dados.preco) || 0,
      categoria_id: dados.categoria_id == null ? null : Number(dados.categoria_id),
      categoria: null,
      imagem_url: (dados.imagem_url as string | null) ?? null,
      ativo: ehVerdadeiro(dados.ativo),
    },
    ficha: bruta.map((item) => ({
      insumo_id: Number(item.id),
      unidade_medida: String(item.unidade_medida ?? ""),
      quantidade_necessaria: Number(item.quantidade_necessaria) || 0,
    })),
  };
}

/** POST /api/produtos — cria com ficha opcional (transação no backend). */
export async function criarProduto(
  token: string,
  dados: {
    nome: string;
    descricao?: string | null;
    preco: number;
    categoria_id?: number | null;
    imagem_url?: string | null;
    ficha_tecnica: ItemFicha[];
  },
): Promise<{ id: number }> {
  return requisitar<{ id: number }>("/produtos", token, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

/** PUT /api/produtos/:id — dados básicos (parcial, com ativo). */
export async function atualizarProduto(
  token: string,
  id: number,
  dados: {
    nome?: string;
    descricao?: string | null;
    preco?: number;
    categoria_id?: number | null;
    imagem_url?: string | null;
    ativo?: boolean;
  },
): Promise<void> {
  await requisitar(`/produtos/${id}`, token, { method: "PUT", body: JSON.stringify(dados) });
}

/** PUT /api/produtos/:id/ficha-tecnica — substitui a receita inteira. */
export async function salvarFichaTecnica(
  token: string,
  id: number,
  ficha: Array<{ insumo_id: number; quantidade_necessaria: number }>,
): Promise<void> {
  await requisitar(`/produtos/${id}/ficha-tecnica`, token, {
    method: "PUT",
    body: JSON.stringify({ ficha_tecnica: ficha }),
  });
}

/** DELETE /api/produtos/:id — 409 com vendas vinculadas. */
export async function removerProduto(token: string, id: number): Promise<void> {
  await requisitar(`/produtos/${id}`, token, { method: "DELETE" });
}

/** GET /api/categorias — público, alimenta selects do painel. */
export async function listarCategorias(): Promise<Categoria[]> {
  const resposta = await fetch(`${BASE}/categorias`);
  if (!resposta.ok) throw new ErroApi(resposta.status, "Não foi possível carregar as categorias.");
  const lista = (await resposta.json()) as Array<Record<string, unknown>>;
  return lista.map((c) => ({ id: Number(c.id), nome: String(c.nome ?? "") }));
}

/** POST /api/categorias — nome duplicado volta 409 do backend. */
export async function criarCategoria(token: string, nome: string): Promise<{ id: number }> {
  return requisitar<{ id: number }>("/categorias", token, {
    method: "POST",
    body: JSON.stringify({ nome }),
  });
}

/** PUT /api/categorias/:id — edição parcial (COALESCE no backend). */
export async function atualizarCategoria(token: string, id: number, nome: string): Promise<void> {
  await requisitar(`/categorias/${id}`, token, { method: "PUT", body: JSON.stringify({ nome }) });
}

/** DELETE /api/categorias/:id — categoria é ON DELETE SET NULL nos produtos. */
export async function removerCategoria(token: string, id: number): Promise<void> {
  await requisitar(`/categorias/${id}`, token, { method: "DELETE" });
}
