import type { ItemCarrinho } from "../types";
import { formatarMoeda } from "./formatarMoeda";

// Toda a "regra de negócio" da sacola mora aqui, fora dos componentes:
// calcular total e montar o texto/link do WhatsApp são funções puras,
// então dá para testar e reutilizar sem renderizar nada.

// Soma quantidade × preço de cada item (preço já é number normalizado).
export function calcularTotal(itens: ItemCarrinho[]): number {
  return itens.reduce(
    (acumulado, item) => acumulado + item.produto.preco * item.quantidade,
    0,
  );
}

// Soma só as quantidades (para o contador da sacola no topo).
export function contarUnidades(itens: ItemCarrinho[]): number {
  return itens.reduce((acumulado, item) => acumulado + item.quantidade, 0);
}

// Texto do toast ao adicionar: "2x Cone doce tradicional na sacola 🧁".
// Centralizado aqui para todas as telas falarem igual.
export function mensagemAdicionado(
  nomeProduto: string | undefined,
  novaQuantidade: number,
): string {
  if (!nomeProduto) return "Adicionado à sacola 🧁";
  return `${novaQuantidade}x ${nomeProduto} na sacola 🧁`;
}

// Texto que a pessoa vai enviar no WhatsApp, já com itens, total e nome.
export function montarMensagemPedido(
  itens: ItemCarrinho[],
  nomeCliente: string,
  observacao: string,
): string {
  const linhas = itens.map(
    (item) =>
      `• ${item.quantidade}x ${item.produto.nome} — ${formatarMoeda(item.produto.preco * item.quantidade)}`,
  );
  let mensagem = `Olá! Quero fazer um pedido 🧁\n\n${linhas.join("\n")}\n\nTotal: ${formatarMoeda(calcularTotal(itens))}`;
  if (nomeCliente.trim() !== "") mensagem += `\nNome: ${nomeCliente.trim()}`;
  if (observacao.trim() !== "") mensagem += `\nObs: ${observacao.trim()}`;
  return mensagem;
}

// Link wa.me com o texto codificado; número só com dígitos (DDI+DDD).
export function montarLinkWhats(numeroLoja: string, mensagem: string): string {
  const somenteDigitos = numeroLoja.replace(/\D/g, "");
  return `https://wa.me/${somenteDigitos}?text=${encodeURIComponent(mensagem)}`;
}
