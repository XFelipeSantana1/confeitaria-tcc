import { useCallback, useEffect, useState } from "react";
import type { Pedido } from "../types";
import { ErroApi, definirPagamentoPedido, definirStatusPedido, listarPedidos } from "../lib/api";

// Lista de pedidos com filtro por status.
//
// O hook guarda a lista INTEIRA e deriva a aba visível. Antes ele guardava só
// a aba filtrada, e aí duas coisas davam errado: trocar de aba refazia a
// requisição (o filtro é do cliente, não precisa) e, pior, um pedido que saía
// da aba continuava aparecendo nela com o status novo — a linha só sumia
// quando a pessoa mudava de aba por acaso.
export function usePedidos(token: string | null): {
  pedidos: Pedido[];
  /** A lista sem filtro: é o que alimenta as contagens das abas. */
  todos: Pedido[];
  filtro: string;
  definirFiltro: (filtro: string) => void;
  carregando: boolean;
  erro: string | null;
  precisaLogin: boolean;
  buscarNovamente: () => void;
  mudarStatus: (id: number, status: string) => Promise<void>;
  mudarPagamento: (id: number, status: string) => Promise<void>;
} {
  const [todos, definirTodos] = useState<Pedido[]>([]);
  const [filtro, definirFiltro] = useState("todos");
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState<string | null>(null);
  const [precisaLogin, definirPrecisaLogin] = useState(false);

  const buscar = useCallback(async () => {
    if (!token) {
      definirCarregando(false);
      return;
    }
    definirCarregando(true);
    definirErro(null);
    // Zera a partir de cada busca: sem isso, um 401 isolado deixaria a tela
    // presa no "sair" mesmo depois de a sessão voltar.
    definirPrecisaLogin(false);
    try {
      definirTodos(await listarPedidos(token));
    } catch (falha) {
      if (falha instanceof ErroApi && falha.codigo === 401) {
        definirPrecisaLogin(true);
      } else {
        definirErro(falha instanceof Error ? falha.message : "Não foi possível carregar os pedidos.");
      }
    } finally {
      definirCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  // Recarrega em vez de remendar a linha: cancelar um pedido pago também
  // estorna o pagamento, e um update local deixaria a linha mostrando "a
  // receber" para um pedido cancelado.
  async function mudarStatus(id: number, status: string): Promise<void> {
    if (!token) return;
    await definirStatusPedido(token, id, status);
    await buscar();
  }

  async function mudarPagamento(id: number, status: string): Promise<void> {
    if (!token) return;
    await definirPagamentoPedido(token, id, status);
    await buscar();
  }

  return {
    pedidos: filtro === "todos" ? todos : todos.filter((p) => p.status === filtro),
    todos,
    filtro,
    definirFiltro,
    carregando,
    erro,
    precisaLogin,
    buscarNovamente: buscar,
    mudarStatus,
    mudarPagamento,
  };
}