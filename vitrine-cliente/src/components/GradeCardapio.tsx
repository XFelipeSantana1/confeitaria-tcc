import type { Produto } from "../types";
import type { SecaoProdutos } from "../lib/secoes";
import { identificadorSecao, numeroSecao } from "../lib/secoes";
import { CardDestaque } from "./CardDestaque";
import { GrupoCategoria } from "./GrupoCategoria";

// A grade em si: destaque largo no topo e depois um grupo por categoria.
// SEM Cartao em volta: a seção respira direto sobre o creme e se separa
// pelas filetes do próprio título — cartão em volta de card era superfície
// dentro de superfície. Saiu do SecaoCardapio para lá sobrar só a parte de
// agrupar, filtrar e decidir entre carregando / erro / vazio / conteúdo.
interface PropriedadesGradeCardapio {
  destaque: Produto | undefined;
  secoes: SecaoProdutos[];
  quantidades: Record<number, number>;
  // O card grid só passa a quantidade (1 por clique); a soma para vários
  // quantidades mora nos avisos. Tipo mais estreito aqui de propósito.
  aoAdicionar: (produtoId: number) => void;
  aoAlterarQuantidade: (produtoId: number, diferenca: number) => void;
  /** Lixeira: tira o produto TODO da sacola em um toque. */
  aoRemover: (produtoId: number) => void;
}

export function GradeCardapio({
  destaque,
  secoes,
  quantidades,
  aoAdicionar,
  aoAlterarQuantidade,
  aoRemover,
}: PropriedadesGradeCardapio): JSX.Element {
  return (
    <>
      {destaque && (
        <div className="mb-10">
          <CardDestaque
            produto={destaque}
            quantidadeNaSacola={quantidades[destaque.id] ?? 0}
            aoAdicionar={aoAdicionar}
            aoAlterarQuantidade={aoAlterarQuantidade}
            aoRemover={aoRemover}
          />
        </div>
      )}
      {secoes.map((secao, indice) =>
        secao.itens.length === 0 ? null : (
          <GrupoCategoria
            key={secao.categoria}
            categoria={secao.categoria}
            numero={numeroSecao(indice)}
            itens={secao.itens}
            quantidades={quantidades}
            espacamentoTopo={indice === 0 && !destaque ? "mt-0" : "mt-10"}
            identificador={identificadorSecao(secao.categoria)}
            aoAdicionar={aoAdicionar}
            aoAlterarQuantidade={aoAlterarQuantidade}
            aoRemover={aoRemover}
          />
        ),
      )}
    </>
  );
}
