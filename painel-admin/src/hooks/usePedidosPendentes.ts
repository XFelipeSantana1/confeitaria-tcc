import { useCallback, useEffect, useState } from "react";
import { ErroApi, listarPedidos } from "../lib/api";

/**
 * Quantos pedidos estão esperando ação, para o menu mostrar o número.
 *
 * Fica num hook separado, e não dentro do `useResumo`, por dois motivos:
 * a barra lateral existe em TODAS as telas (entrar no painel já tem que
 * mostrar o número, não só quando a pessoa abre o Resumo), e o card de
 * pedidos do Resumo traz nome, itens e total — dado que a navigation não
 * usa e que não vale a pena baixar em toda troca de tela.
 *
 * Por isso a chamada é a mais barata que existe (`/pedidos`) e o intervalo
 * é de 30 s: um pedido novo não é urgência, e a tela de Pedidos recarrega
 * sozinha quando alguém age nele.
 */
export function usePedidosPendentes(token: string | null): number | null {
  const [pendentes, definirPendentes] = useState<number | null>(null);
  const [tokenAtual, definirToken] = useState<string | null>(token);

  // O token muda quando o gestor entra de novo; guardar em estado mantém o
  // hook estável sem capturar um token que já expirou na primeira chamada.
  if (token !== tokenAtual) definirToken(token);

  const buscar = useCallback(async () => {
    if (tokenAtual === null) return;
    try {
      const lista = await listarPedidos(tokenAtual);
      definirPendentes(lista.filter((pedido) => pedido.status === "pendente").length);
    } catch (falha) {
      // Falha aqui não pode derrubar a tela nem deslogar: o contador é
      // conforto, e um 401 momentâneo perderia a sessão do gestor.
      if (!(falha instanceof ErroApi && falha.codigo === 401)) {
        console.warn("Não consegui contar os pedidos pendentes.", falha);
      }
      definirPendentes(null);
    }
  }, [tokenAtual]);

  useEffect(() => {
    void buscar();
    const intervalo = setInterval(() => void buscar(), 30_000);
    return () => clearInterval(intervalo);
  }, [buscar]);

  return pendentes;
}
