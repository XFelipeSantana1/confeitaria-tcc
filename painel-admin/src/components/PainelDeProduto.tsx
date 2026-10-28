import type { Categoria, Insumo, ProdutoAdmin } from "../types";
import type { Janela } from "../hooks/useJanelaProduto";
import type { DadosProduto } from "./ModalProduto";
import { ModaisProduto } from "./ModaisProduto";
import { PainelCategorias, type FiltroCategoria } from "./PainelCategorias";

/**
 * Janelas da tela de Produtos: o formulário do produto, a confirmação de
 * exclusão e o painel de categorias.
 *
 * Ficavam no fim da página e deixavam o arquivo em 235 linhas. Separado, o
 * arquivo da tela tem só dados, filtros e lista; a montagem das sobreposições
 * mora aqui, onde a única responsabilidade é existir quando pedida.
 */
export function PainelDeProduto({
  janela,
  categorias,
  insumos,
  produtos,
  filtro,
  painelAberto,
  salvando,
  erroModal,
  aoFecharJanela,
  aoSalvar,
  aoEnviarImagem,
  aoConfirmarExcluir,
  aoFiltrar,
  aoFecharCategorias,
  aoCriarCategoria,
  aoRenomearCategoria,
  aoRemoverCategoria,
}: {
  janela: Janela;
  categorias: Categoria[];
  insumos: Insumo[];
  produtos: ProdutoAdmin[];
  filtro: FiltroCategoria;
  painelAberto: boolean;
  salvando: boolean;
  erroModal: string | null;
  aoFecharJanela: () => void;
  aoSalvar: (dados: DadosProduto) => void;
  aoEnviarImagem: (arquivo: File) => Promise<string>;
  aoConfirmarExcluir: () => void;
  aoFiltrar: (filtro: FiltroCategoria) => void;
  aoFecharCategorias: () => void;
  aoCriarCategoria: (nome: string) => Promise<void>;
  aoRenomearCategoria: (id: number, nome: string) => Promise<void>;
  aoRemoverCategoria: (categoria: Categoria) => Promise<void>;
}): JSX.Element {
  return (
    <>
      <ModaisProduto
        janela={janela}
        categorias={categorias}
        insumos={insumos}
        salvando={salvando}
        erroModal={erroModal}
        aoFechar={aoFecharJanela}
        aoSalvar={aoSalvar}
        aoEnviarImagem={aoEnviarImagem}
        aoConfirmarExcluir={aoConfirmarExcluir}
      />

      {painelAberto ? (
        <PainelCategorias
          categorias={categorias}
          produtos={produtos}
          filtro={filtro}
          aoFiltrar={aoFiltrar}
          aoFechar={aoFecharCategorias}
          aoCriar={aoCriarCategoria}
          aoRenomear={aoRenomearCategoria}
          aoRemover={aoRemoverCategoria}
        />
      ) : null}
    </>
  );
}
