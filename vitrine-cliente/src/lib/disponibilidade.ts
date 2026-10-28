import type { Produto } from "../types";

// Decide se o botão "Adicionar" aparece ativo. Hoje a API pública lista só
// produtos ativos e não informa estoque por produto, então quase tudo cai no
// `true` final — mas quando o backend passar a enviar `disponivel` ou
// `quantidade_disponivel`, a vitrine já reage sem mudar componente nenhum.
export function estaDisponivel(produto: Produto): boolean {
  if (produto.ativo === false) return false;
  if (produto.disponivel === false) return false;
  if (
    produto.quantidadeDisponivel !== undefined &&
    produto.quantidadeDisponivel <= 0
  ) {
    return false;
  }
  return true;
}
