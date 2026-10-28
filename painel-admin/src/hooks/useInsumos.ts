import { useCallback, useEffect, useState } from "react";
import type { Insumo } from "../types";
import {
  ErroApi,
  atualizarInsumo,
  criarInsumo,
  listarInsumos,
  movimentarInsumo,
  removerInsumo,
} from "../lib/api";

// CRUD de insumos + movimentação. Cada ação recarrega a lista (o painel é
// operado por uma pessoa, não precisa de otimismo aqui — dado fresco).
export function useInsumos(token: string | null): {
  insumos: Insumo[];
  carregando: boolean;
  erro: string | null;
  precisaLogin: boolean;
  buscarNovamente: () => void;
  criar: (dados: {
    nome: string;
    unidade_medida: string;
    quantidade_atual: number;
    quantidade_minima: number;
    custo_unitario: number;
  }) => Promise<void>;
  atualizar: (
    id: number,
    dados: { nome?: string; unidade_medida?: string; quantidade_minima?: number; custo_unitario?: number },
  ) => Promise<void>;
  remover: (id: number) => Promise<void>;
  movimentar: (id: number, dados: { tipo: string; quantidade: number; observacao?: string }) => Promise<void>;
} {
  const [insumos, definirInsumos] = useState<Insumo[]>([]);
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
      definirInsumos(await listarInsumos(token));
    } catch (falha) {
      if (falha instanceof ErroApi && falha.codigo === 401) {
        definirPrecisaLogin(true);
      } else {
        definirErro(falha instanceof Error ? falha.message : "Não foi possível carregar os insumos.");
      }
    } finally {
      definirCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  // Ações que falham sobem ErroApi para o modal/página exibir (409 com
  // vínculo, 400 de validação) — o hook não engole mensagem do backend.
  async function criar(dados: {
    nome: string;
    unidade_medida: string;
    quantidade_atual: number;
    quantidade_minima: number;
    custo_unitario: number;
  }): Promise<void> {
    if (!token) return;
    await criarInsumo(token, dados);
    await buscar();
  }

  async function atualizar(
    id: number,
    dados: { nome?: string; unidade_medida?: string; quantidade_minima?: number; custo_unitario?: number },
  ): Promise<void> {
    if (!token) return;
    await atualizarInsumo(token, id, dados);
    await buscar();
  }

  async function remover(id: number): Promise<void> {
    if (!token) return;
    await removerInsumo(token, id);
    await buscar();
  }

  async function movimentar(
    id: number,
    dados: { tipo: string; quantidade: number; observacao?: string },
  ): Promise<void> {
    if (!token) return;
    await movimentarInsumo(token, id, dados);
    await buscar();
  }

  return {
    insumos,
    carregando,
    erro,
    precisaLogin,
    buscarNovamente: buscar,
    criar,
    atualizar,
    remover,
    movimentar,
  };
}
