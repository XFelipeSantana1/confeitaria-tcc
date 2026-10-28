import type { Produto } from "../types";
import { CardProduto } from "./CardProduto";

// Uma categoria dentro do cardápio: cabeçalho editorial (numeração + nome
// Playfair + filete) e a grade de doces — direto sobre o creme, sem cartão
// em volta.
//
// No celular é LISTA escaneável em uma coluna: nome → descrição → preço →
// ação, com miniatura à direita e hairlines separando os itens (é cardápio
// impresso, não vitrine de caixinhas) — duas colunas empilhavam demais e o
// carrossel lateral (versão anterior) escondia itens atrás de um gesto que
// ninguém descobre. No desktop a grade é ASSIMÉTRICA: o primeiro produto da
// categoria nasce grande (row-span 2) e os demais ficam menores ao lado —
// a categoria tem um "capa" e um sumário, como página de revista.
interface PropriedadesGrupoCategoria {
  categoria: string;
  numero: string;
  itens: Produto[];
  quantidades: Record<number, number>;
  espacamentoTopo: string;
  identificador: string;
  aoAdicionar: (produtoId: number) => void;
  aoAlterarQuantidade: (produtoId: number, diferenca: number) => void;
  /** Lixeira: tira o produto TODO da sacola em um toque. */
  aoRemover: (produtoId: number) => void;
}

export function GrupoCategoria({
  categoria,
  numero,
  itens,
  quantidades,
  espacamentoTopo,
  identificador,
  aoAdicionar,
  aoAlterarQuantidade,
  aoRemover,
}: PropriedadesGrupoCategoria): JSX.Element {
  // Um "capa" grande só quando há ao menos 2 itens: categoria com um doce
  // único não tem "demais" para contrapor.
  const temCapa = itens.length > 1;

  return (
    <section
      id={identificador}
      className={espacamentoTopo}
      // Desconto de cabeçalho + abas fixas pela variável (igual ao main):
      // número chutado pousava o título atrás da barra.
      style={{ scrollMarginTop: "calc(var(--altura-cabecalho, 67px) + 60px)" }}
    >
      <div className="mb-4 flex items-baseline gap-3">
        {/* Numeração editorial ("01 — Doces"): cara de cardápio impresso, em
            Manrope com tracking aberto — técnica, não decorativa. Semibold
            tabular: número que cresce sem pular um pixel. */}
        <span
          className="font-numero text-xs font-semibold tracking-[0.25em] text-carameloForte tabular-nums"
          aria-hidden="true"
        >
          {numero}
        </span>
        <h3 className="font-display text-2xl font-bold tracking-tight text-tinta text-balance md:text-3xl">
          {categoria}
        </h3>
        <span className="h-px min-w-6 flex-1 bg-borda" aria-hidden="true" />
      </div>
      {/* Celular = lista em 1 coluna com hairlines (`divide-y`); a partir de
          sm os hairlines saem e volta a grade de cartões com vão. */}
      <div className="grid grid-cols-1 divide-y divide-borda sm:grid-cols-2 sm:divide-y-0 sm:gap-3 lg:grid-cols-3 lg:gap-4">
        {itens.map((produto, indice) => (
          <div
            key={produto.id}
            // `row-span` vai na CÉLULA do grid (o wrapper), não no card
            // interno — o article abaixo só estica para preencher.
            className={`min-w-0 ${temCapa && indice === 0 ? "lg:row-span-2" : ""}`}
          >
            <CardProduto
              produto={produto}
              grande={temCapa && indice === 0}
              quantidadeNaSacola={quantidades[produto.id] ?? 0}
              aoAdicionar={aoAdicionar}
              aoAlterarQuantidade={aoAlterarQuantidade}
              aoRemover={aoRemover}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
