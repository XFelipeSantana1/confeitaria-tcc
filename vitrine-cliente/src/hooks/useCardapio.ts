import { useCallback, useEffect, useRef, useState } from "react";
import type { EstadoCardapio, Produto } from "../types";
import { buscarCategorias, buscarProdutos } from "../lib/api";
import {
  CATEGORIAS_DEMONSTRACAO,
  PRODUTOS_DEMONSTRACAO,
} from "../lib/dadosDemonstracao";

// Janela mínima entre duas atualizações automáticas. Voltar para a aba dispara
// `focus` e `visibilitychange` juntos; sem esta trava a vitrine pediria o
// cardápio duas vezes no mesmo instante.
const INTERVALO_MINIMO_MS = 15_000;

// Cardápio com três estados distintos, porque são três momentos diferentes:
// `carregando` (primeira carga, tela de esqueleto), `atualizando` (recarga
// silenciosa, só o botão gira) e `erro` (tela cheia, só quando não havia nada
// antes). Sem essa separação, recarregar derrubaria a vitrine inteira e o
// cliente perderia a rolagem por causa de uma mudança que ele não fez.
export function useCardapio(): {
  produtos: Produto[];
  categorias: string[];
} & EstadoCardapio {
  const [produtos, definirProdutos] = useState<Produto[]>([]);
  const [categorias, definirCategorias] = useState<string[]>([]);
  const [carregando, definirCarregando] = useState<boolean>(true);
  const [atualizando, definirAtualizando] = useState<boolean>(false);
  const [erro, definirErro] = useState<string | null>(null);
  const [falhaNaAtualizacao, definirFalha] = useState<string | null>(null);
  const [modoDemonstracao, definirDemonstracao] = useState<boolean>(false);

  // Refs em vez de estado: mudam a cada requisição sem provocar render nem
  // obrigar o efeito de foco a se registrar de novo a cada render.
  const emVoo = useRef<boolean>(false);
  const ultimaBusca = useRef<number>(0);

  const carregar = useCallback(async (silencioso: boolean): Promise<void> => {
    // Duas abas + F5 somados dariam requisições duplicadas do mesmo payload.
    if (emVoo.current) return;
    emVoo.current = true;
    ultimaBusca.current = Date.now();

    if (silencioso) {
      definirAtualizando(true);
    } else {
      definirCarregando(true);
      definirErro(null);
      definirDemonstracao(false);
    }

    try {
      const [listaCategorias, listaProdutos] = await Promise.all([
        buscarCategorias(),
        buscarProdutos(),
      ]);
      definirCategorias(listaCategorias);
      definirProdutos(listaProdutos);
      definirFalha(null);
      // Sai do modo demonstração se a API respondeu: mostrar dado falso com a
      // etiqueta "demonstração" seria mentir sobre a origem do que está na tela.
      if (silencioso) definirDemonstracao(false);
    } catch (falha) {
      // Erro propositalmente amigável: detalhe técnico não ajuda a cliente.
      const mensagem =
        falha instanceof Error
          ? falha.message
          : "Não foi possível carregar o cardápio.";
      if (silencioso) {
        // Recarga falhou com a vitrine de pé: esvaziar a tela seria pior que
        // mostrar o dado velho. Vira um aviso, não uma tela de erro.
        definirFalha(mensagem);
      } else {
        definirErro(mensagem);
        definirProdutos([]);
        definirCategorias([]);
      }
    } finally {
      emVoo.current = false;
      if (silencioso) definirAtualizando(false);
      else definirCarregando(false);
    }
  }, []);

  // Carga inicial e "Tentar novamente" da tela de erro: só o que realmente
  // falha na primeira tentativa justifica derrubar a tela inteira.
  const buscarNovamente = useCallback(() => {
    void carregar(false);
  }, [carregar]);

  // Botão "Atualizar" e recarga ao voltar para a aba.
  const atualizarCardapio = useCallback(() => {
    void carregar(true);
  }, [carregar]);

  useEffect(() => {
    void carregar(false);
  }, [carregar]);

  // Esta é a correção de "ativei o produto no painel e a vitrine não mudou".
  // Quem mexe no cardápio está no painel, outra aba do navegador; quando o
  // cliente volta para a vitrine o foco muda e recarregamos. Resolve sem
  // WebSocket e sem polling contínuo — decisão já tomada no projeto.
  useEffect(() => {
    function aoVoltarParaVitrine(): void {
      if (document.hidden) return;
      if (Date.now() - ultimaBusca.current < INTERVALO_MINIMO_MS) return;
      void carregar(true);
    }
    window.addEventListener("focus", aoVoltarParaVitrine);
    document.addEventListener("visibilitychange", aoVoltarParaVitrine);
    return () => {
      window.removeEventListener("focus", aoVoltarParaVitrine);
      document.removeEventListener("visibilitychange", aoVoltarParaVitrine);
    };
  }, [carregar]);

  // Demonstração é opt-in explícito (botão na tela de erro), nunca fallback
  // silencioso — erro de rede deve aparecer como erro, não como sucesso falso.
  function usarDemonstracao(): void {
    definirProdutos(PRODUTOS_DEMONSTRACAO);
    definirCategorias(CATEGORIAS_DEMONSTRACAO);
    definirErro(null);
    definirFalha(null);
    definirDemonstracao(true);
  }

  return {
    produtos,
    categorias,
    carregando,
    atualizando,
    erro,
    falhaNaAtualizacao,
    modoDemonstracao,
    buscarNovamente,
    atualizarCardapio,
    usarDemonstracao,
  };
}
