import { useState } from "react";
import type { ProdutoAdmin } from "../types";
import { ErroApi } from "../lib/api";
import type { DadosProduto } from "../components/ModalProduto";
import type { DadosNovoProduto, DadosProdutoBasico } from "./useProdutos";
import type { ItemFicha } from "../types";

// Ações de escrita que o useProdutos já sabe fazer. Recebidas por parâmetro
// para não repetir a chamada à API nem duplicar o cacheamento da lista.
export interface AcoesProduto {
  criar: (dados: DadosNovoProduto) => Promise<number>;
  atualizar: (id: number, dados: DadosProdutoBasico) => Promise<void>;
  salvarFicha: (id: number, ficha: ItemFicha[]) => Promise<void>;
  remover: (id: number) => Promise<void>;
  carregarFicha: (id: number) => Promise<{ produto: ProdutoAdmin; ficha: ItemFicha[] }>;
}

// Janelas (formulário e excluir) + o "mold": executa a ação, fecha em
// sucesso e mostra o erro do backend dentro do próprio modal. Tira da página
// a repetição de try/catch/finally em cada ação.
export type Janela =
  | { tipo: "fechada" }
  | { tipo: "produto"; produto: ProdutoAdmin | null; ficha: DadosProduto["ficha"] }
  | { tipo: "excluir"; produto: ProdutoAdmin };

export function useJanelaProduto(acoes: AcoesProduto): {
  janela: Janela;
  abrindo: boolean;
  erro: string | null;
  aviso: string | null;
  abrirNovo: () => void;
  abrirEdicao: (produto: ProdutoAdmin) => void;
  pedirExclusao: (produto: ProdutoAdmin) => void;
  fechar: () => void;
  salvarProduto: (dados: DadosProduto) => Promise<void>;
  confirmarExclusao: () => Promise<void>;
} {
  const [janela, definirJanela] = useState<Janela>({ tipo: "fechada" });
  const [salvando, definirSalvando] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);
  const [aviso, definirAviso] = useState<string | null>(null);

  async function executar(acao: () => Promise<unknown>): Promise<void> {
    definirSalvando(true);
    definirErro(null);
    try {
      await acao();
      definirJanela({ tipo: "fechada" });
    } catch (falha) {
      definirErro(
        falha instanceof ErroApi ? falha.message : "A ação falhou. Tente de novo.",
      );
    } finally {
      definirSalvando(false);
    }
  }

  return {
    janela,
    abrindo: salvando,
    erro,
    aviso,
    abrirNovo: () => {
      definirErro(null);
      definirAviso(null);
      definirJanela({ tipo: "produto", produto: null, ficha: [] });
    },
    // Editar carrega a ficha atual (GET /admin/:id) antes de abrir o modal.
    abrirEdicao: (produto) => {
      definirErro(null);
      definirAviso(null);
      void (async () => {
        try {
          const { ficha } = await acoes.carregarFicha(produto.id);
          definirJanela({ tipo: "produto", produto, ficha });
        } catch (falha) {
          definirAviso(
            falha instanceof Error ? falha.message : "Não foi possível abrir a edição.",
          );
        }
      })();
    },
    pedirExclusao: (produto) => {
      definirErro(null);
      // Limpa o aviso anterior: ele fica no topo da tela e não tem botão de
      // fechar, então "não consegui abrir a edição" continuava ali depois que
      // a pessoa já tinha aberto a janela de exclusão.
      definirAviso(null);
      definirJanela({ tipo: "excluir", produto });
    },
    fechar: () => {
      definirJanela({ tipo: "fechada" });
      definirAviso(null);
    },
    salvarProduto: async (dados) => {
      if (janela.tipo !== "produto") return;
      const alvo = janela.produto;
      if (alvo === null) {
        // Novo produto: o backend cria dados + ficha numa trans só.
        await executar(() =>
          acoes.criar({
            nome: dados.nome,
            descricao: dados.descricao || undefined,
            preco: dados.preco,
            categoria_id: dados.categoria_id,
            imagem_url: dados.imagem_url || undefined,
            ficha_tecnica: dados.ficha,
          }),
        );
        return;
      }
      // Edição em duas chamadas (dados + ficha), como o backend separa.
      await executar(async () => {
        await acoes.atualizar(alvo.id, {
          nome: dados.nome,
          descricao: dados.descricao || null,
          preco: dados.preco,
          categoria_id: dados.categoria_id,
          imagem_url: dados.imagem_url || null,
        });
        await acoes.salvarFicha(alvo.id, dados.ficha);
      });
    },
    confirmarExclusao: async () => {
      if (janela.tipo !== "excluir") return;
      await executar(() => acoes.remover(janela.produto.id));
    },
  };
}
