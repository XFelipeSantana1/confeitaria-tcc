import { useCallback, useEffect, useState } from "react";
import type { Insumo, Pedido, ProdutoVendido } from "../types";
import { ErroApi, listarBaixoEstoque, listarMaisVendidos, listarPedidos } from "../lib/api";

// Dados do Resumo: três buscas em paralelo com carregando + erro (padrão do
// painel). O token expira? ErroApi 401 sobe para a página deslogar.
export interface DadosResumo {
  pedidos: Pedido[];
  baixoEstoque: Insumo[];
  maisVendidos: ProdutoVendido[];
}

export function useResumo(token: string | null): DadosResumo & {
  carregando: boolean;
  erro: string | null;
  precisaLogin: boolean;
  buscarNovamente: () => void;
} {
  const [dados, definirDados] = useState<DadosResumo>({
    pedidos: [],
    baixoEstoque: [],
    maisVendidos: [],
  });
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
      const [pedidos, baixoEstoque, maisVendidos] = await Promise.all([
        listarPedidos(token),
        listarBaixoEstoque(token),
        listarMaisVendidos(token),
      ]);
      definirDados({ pedidos, baixoEstoque, maisVendidos });
    } catch (falha) {
      if (falha instanceof ErroApi && falha.codigo === 401) {
        definirPrecisaLogin(true);
      } else {
        definirErro(
          falha instanceof Error ? falha.message : "Não foi possível carregar o resumo.",
        );
      }
    } finally {
      definirCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { ...dados, carregando, erro, precisaLogin, buscarNovamente: buscar };
}
