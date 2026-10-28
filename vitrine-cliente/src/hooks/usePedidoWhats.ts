import { useCallback } from "react";
import type { ItemCarrinho } from "../types";
import { montarLinkWhats, montarMensagemPedido } from "../lib/mensagemWhats";
import { lerWhats } from "../lib/whatsLoja";

// MVP: sem checkout via API — a sacola vira texto e abre o wa.me. Por quê:
// a regra de negócio do pedido ainda não está na vitrine, e mandar o cliente
// direto para o WhatsApp da confeiteira é o caminho mais curto sem inventar
// um pagamento que não existe. Quando a integração real for plugada, este é
// o único ponto que precisa mudar.
export function usePedidoWhats(
  itens: ItemCarrinho[],
  nomeCliente: string,
  observacao: string,
  mostrarAviso: (texto: string) => void,
): { finalizar: () => void } {
  const finalizar = useCallback((): void => {
    if (itens.length === 0) {
      mostrarAviso("Sua sacola está vazia.");
      return;
    }
    const numero = lerWhats();
    if (numero === "") {
      mostrarAviso("Configure o WhatsApp da loja na engrenagem.");
      return;
    }
    const mensagem = montarMensagemPedido(itens, nomeCliente, observacao);
    window.open(montarLinkWhats(numero, mensagem), "_blank");
    mostrarAviso("Abrindo o WhatsApp…");
  }, [itens, nomeCliente, observacao, mostrarAviso]);

  return { finalizar };
}
