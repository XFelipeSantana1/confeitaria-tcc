import type { Produto } from "../types";

// Agrupamento do cardápio em seções: mora em lib (não em componente) porque
// é transformação pura de dados — mesma entrada, mesma saída, testável sem
// renderizar nada.

export interface SecaoProdutos {
  categoria: string;
  itens: Produto[];
}

// Numeração editorial das seções ("01", "02"...): cara de cardápio impresso.
export function numeroSecao(indice: number): string {
  return String(indice + 1).padStart(2, "0");
}

// Slug estável para id de seção e observer (tira acento e espaço).
export function identificadorSecao(nome: string): string {
  return `secao-${nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")}`;
}

// Seções na ordem do backend, vazias fora; produto sem categoria válida cai
// em "Outros" no final em vez de sumir do cardápio.
export function agruparPorCategoria(
  produtos: Produto[],
  categorias: string[],
): SecaoProdutos[] {
  const secoes = categorias
    .map((categoria) => ({
      categoria,
      itens: produtos.filter((produto) => produto.categoria === categoria),
    }))
    .filter((secao) => secao.itens.length > 0);
  const semCategoria = produtos.filter(
    (produto) => produto.categoria === null || !categorias.includes(produto.categoria),
  );
  if (semCategoria.length > 0) {
    secoes.push({ categoria: "Outros", itens: semCategoria });
  }
  return secoes;
}

// Destaque só sem busca: primeiro produto da primeira seção sai do grid e
// vira o card horizontal largo do topo.
export function separarDestaque(
  secoes: SecaoProdutos[],
  buscaAtiva: boolean,
): { destaque: Produto | undefined; restantes: SecaoProdutos[] } {
  const destaque =
    !buscaAtiva && secoes.length > 0 ? secoes[0]?.itens[0] : undefined;
  if (!destaque) return { destaque: undefined, restantes: secoes };
  return {
    destaque,
    restantes: secoes.map((secao, indice) =>
      indice === 0
        ? {
            ...secao,
            itens: secao.itens.filter((item) => item.id !== destaque.id),
          }
        : secao,
    ),
  };
}
