import { useCallback, useEffect, useState } from "react";
import type { Categoria, Insumo, ItemFicha, ProdutoAdmin } from "../types";
import {
  ErroApi,
  atualizarCategoria as apiAtualizarCategoria,
  atualizarProduto,
  criarCategoria as apiCriarCategoria,
  criarProduto,
  listarCategorias,
  listarInsumos,
  listarProdutosAdmin,
  obterProdutoAdmin,
  removerCategoria as apiRemoverCategoria,
  removerProduto,
  salvarFichaTecnica,
} from "../lib/api";

// Dono dos dados da tela de Produtos: os produtos, a ficha técnica e as listas
// de apoio (categorias e insumos para os selects).
//
// As categorias passaram a morar aqui junto. Antes tinham hook e tela
// próprias para três registros; agora são atributo de produto — e quem
// cadastra, renomeia ou remove é este mesmo hook, que já tem a lista e o
// recarregamento. Nada de segunda fonte da verdade.
//
// Recarrega após cada escrita: dado fresco no painel.
// Dados de escrita do formulário de produto: usados no criar e no atualizar.
export interface DadosProdutoBasico {
  nome?: string;
  descricao?: string | null;
  preco?: number;
  categoria_id?: number | null;
  imagem_url?: string | null;
  ativo?: boolean;
}

export interface DadosNovoProduto extends DadosProdutoBasico {
  nome: string;
  preco: number;
  ficha_tecnica: ItemFicha[];
}

export function useProdutos(token: string | null): {
  produtos: ProdutoAdmin[];
  categorias: Categoria[];
  insumos: Insumo[];
  carregando: boolean;
  erro: string | null;
  precisaLogin: boolean;
  buscarNovamente: () => void;
  criar: (dados: DadosNovoProduto) => Promise<number>;
  atualizar: (id: number, dados: DadosProdutoBasico) => Promise<void>;
  salvarFicha: (id: number, ficha: ItemFicha[]) => Promise<void>;
  remover: (id: number) => Promise<void>;
  criarCategoria: (nome: string) => Promise<void>;
  atualizarCategoria: (id: number, nome: string) => Promise<void>;
  removerCategoria: (id: number) => Promise<void>;
  carregarFicha: (id: number) => Promise<{ produto: ProdutoAdmin; ficha: ItemFicha[] }>;
} {
  const [produtos, definirProdutos] = useState<ProdutoAdmin[]>([]);
  const [categorias, definirCategorias] = useState<Categoria[]>([]);
  const [insumos, definirInsumos] = useState<Insumo[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState<string | null>(null);
  const [precisaLogin, definirPrecisaLogin] = useState(false);

  const buscar = useCallback(async () => {
    if (!token) {
      definirCarregando(false);
      return;
    }
    definirCarregando(true);
    definirErro(null);
    // Zera a partir de cada busca: sem isso, um 401 isolado deixaria a tela
    // presa no "sair" mesmo depois de a sessão voltar.
    definirPrecisaLogin(false);
    try {
      const [lista, cats, ins] = await Promise.all([
        listarProdutosAdmin(token),
        listarCategorias(),
        listarInsumos(token),
      ]);
      definirProdutos(lista);
      definirCategorias(cats);
      definirInsumos(ins);
    } catch (falha) {
      if (falha instanceof ErroApi && falha.codigo === 401) {
        definirPrecisaLogin(true);
      } else {
        definirErro(falha instanceof Error ? falha.message : "Não foi possível carregar os produtos.");
      }
    } finally {
      definirCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  async function criar(dados: DadosNovoProduto): Promise<number> {
    if (!token) throw new Error("Sem sessão.");
    const criado = await criarProduto(token, dados);
    await buscar();
    return criado.id;
  }

  async function atualizar(id: number, dados: DadosProdutoBasico): Promise<void> {
    if (!token) return;
    await atualizarProduto(token, id, dados);
    await buscar();
  }

  async function salvarFicha(id: number, ficha: ItemFicha[]): Promise<void> {
    if (!token) return;
    await salvarFichaTecnica(token, id, ficha);
    await buscar();
  }

  async function remover(id: number): Promise<void> {
    if (!token) return;
    await removerProduto(token, id);
    await buscar();
  }

  async function criarCategoria(nome: string): Promise<void> {
    if (!token) return;
    await apiCriarCategoria(token, nome);
    await buscar();
  }

  async function atualizarCategoria(id: number, nome: string): Promise<void> {
    if (!token) return;
    await apiAtualizarCategoria(token, id, nome);
    await buscar();
  }

  async function removerCategoria(id: number): Promise<void> {
    if (!token) return;
    await apiRemoverCategoria(token, id);
    await buscar();
  }

  async function carregarFicha(id: number): Promise<{ produto: ProdutoAdmin; ficha: ItemFicha[] }> {
    if (!token) throw new Error("Sem sessão.");
    const { produto, ficha } = await obterProdutoAdmin(token, id);
    return {
      produto,
      ficha: ficha.map((item) => ({
        insumo_id: item.insumo_id,
        quantidade_necessaria: item.quantidade_necessaria,
      })),
    };
  }

  return {
    produtos,
    categorias,
    insumos,
    carregando,
    erro,
    precisaLogin,
    buscarNovamente: buscar,
    criar,
    atualizar,
    salvarFicha,
    remover,
    criarCategoria,
    atualizarCategoria,
    removerCategoria,
    carregarFicha,
  };
}
