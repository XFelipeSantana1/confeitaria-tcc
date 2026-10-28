import type { Produto } from "../types";
import { mensagemAdicionado } from "../lib/mensagemWhats";

// Toasts da sacola com nome e quantidade ("2x Cone doce tradicional 🧁"):
// valem para o botão Confirmar E para o + do stepper — antes só o primeiro
// mostrava aviso, e parecia que a contagem travava no "1x". O − não avisa
// (tirar item pedindo confirmação a cada toque seria pentelho).
export function useAvisosSacola(
  produtos: Produto[],
  quantidades: Record<number, number>,
  aoAdicionarVarios: (produtoId: number, quantidade: number) => void,
  aoAlterarQuantidade: (produtoId: number, diferenca: number) => void,
  aoMostrarAviso: (texto: string) => void,
): {
  adicionarComAviso: (produtoId: number) => void;
  alterarComAviso: (produtoId: number, diferenca: number) => void;
} {
  function textoPara(produtoId: number, novaQuantidade: number): string {
    const produto = produtos.find((item) => item.id === produtoId);
    return mensagemAdicionado(produto?.nome, novaQuantidade);
  }

  // Toast com nome e quantidade a cada entrada ("2x Cone doce na sacola"):
  // vale para o botão Adicionar E para o + do stepper.
  function adicionarComAviso(produtoId: number): void {
    aoAdicionarVarios(produtoId, 1);
    aoMostrarAviso(
      textoPara(produtoId, (quantidades[produtoId] ?? 0) + 1),
    );
  }

  function alterarComAviso(produtoId: number, diferenca: number): void {
    aoAlterarQuantidade(produtoId, diferenca);
    if (diferenca > 0) {
      aoMostrarAviso(
        textoPara(produtoId, (quantidades[produtoId] ?? 0) + diferenca),
      );
    }
  }

  return { adicionarComAviso, alterarComAviso };
}
