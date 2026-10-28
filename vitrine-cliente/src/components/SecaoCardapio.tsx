import type { EstadoCardapio, Produto } from "../types";
import {
  agruparPorCategoria,
  identificadorSecao,
  separarDestaque,
} from "../lib/secoes";
import { useAvisosSacola } from "../hooks/useAvisosSacola";
import { useSecaoVisivel } from "../hooks/useSecaoVisivel";
import { TODAS_CATEGORIAS } from "../types";
import { SecaoCategoria } from "./SecaoCategoria";
import { CabecalhoCardapio } from "./CabecalhoCardapio";
import { GradeCardapio } from "./GradeCardapio";
import { EstadoVazio } from "./EstadoVazio";
import { EsqueletoCardapio } from "./EsqueletoCardapio";
import { AlertaErro } from "./AlertaErro";

// Cardápio em seções por categoria (não mais filtro que esconde tudo):
// navegação sticky por texto com scroll-spy de "onde estou", respiro grande
// ENTRE seções e um destaque horizontal quebrando a simetria do grid. O App
// só entrega os produtos já filtrados pela busca — agrupar e navegar é daqui.
interface PropriedadesSecaoCardapio {
  produtos: Produto[];
  categorias: string[];
  buscaAtiva: boolean;
  estado: EstadoCardapio;
  quantidades: Record<number, number>;
  aoAdicionarVarios: (produtoId: number, quantidade: number) => void;
  aoMostrarAviso: (texto: string) => void;
  aoAlterarQuantidade: (produtoId: number, diferenca: number) => void;
  /** Tira o produto TODO da sacola — a lixeira dos cards usa isso. */
  aoRemover: (produtoId: number) => void;
  aoLimparBusca: () => void;
}

export function SecaoCardapio({
  produtos,
  categorias,
  buscaAtiva,
  estado,
  quantidades,
  aoAdicionarVarios,
  aoMostrarAviso,
  aoAlterarQuantidade,
  aoRemover,
  aoLimparBusca,
}: PropriedadesSecaoCardapio): JSX.Element {
  const { carregando, atualizando, erro, modoDemonstracao } = estado;
  const secoes = agruparPorCategoria(produtos, categorias);

  const { destaque, restantes } = separarDestaque(secoes, buscaAtiva);

  // A navegação e o observador de rolagem olham para o que está REALMENTE na
  // tela, e não para a lista bruta: o destaque sai da primeira categoria, e
  // se ela tinha um único produto a seção inteira desaparecia do DOM. A
  // pílula continuava oferecendo o nome dela e o clique não levava a lugar
  // nenhum — o observador também ficava observando um id inexistente.
  const renderizadas = restantes.filter((secao) => secao.itens.length > 0);

  const { visivel, irPara } = useSecaoVisivel(
    renderizadas.map((secao) => identificadorSecao(secao.categoria)),
  );
  const { adicionarComAviso, alterarComAviso } = useAvisosSacola(
    produtos,
    quantidades,
    aoAdicionarVarios,
    aoAlterarQuantidade,
    aoMostrarAviso,
  );

  function selecionarPilha(categoria: string): void {
    if (categoria === TODAS_CATEGORIAS) {
      document
        .getElementById("cardapio")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    irPara(identificadorSecao(categoria));
  }

  // Categoria ativa = seção visível no scroll (ou "Tudo" no topo).
  const nomesSecoes = renderizadas.map((secao) => secao.categoria);
  const ativa =
    nomesSecoes.find((nome) => identificadorSecao(nome) === visivel) ??
    TODAS_CATEGORIAS;

  // Sem busca o vazio é "a loja ainda não publicou nada", então a ação muda:
  // não adianta limpar um termo que já está vazio.
  const vazioPorBusca = buscaAtiva;

  return (
    // `scroll-mt` também pela variável: o alvo de rolagem precisa parar abaixo
    // da barra + navegação, senão o título da seção fica escondido atrás deles.
    <main
      id="cardapio"
      className="mx-auto max-w-6xl px-5 pt-8"
      style={{ scrollMarginTop: "calc(var(--altura-cabecalho, 67px) + 60px)" }}
    >
      <CabecalhoCardapio
        totalExibido={produtos.length}
        carregando={carregando}
        atualizando={atualizando}
        modoDemonstracao={modoDemonstracao}
        aoAtualizar={estado.atualizarCardapio}
      />

      {/* Abas fixas DEBAIXO do cabeçalho: o sticky é da própria
          SecaoCategoria (usa a mesma variável de altura). Sem wrapper aqui —
          o papel desta seção é agrupar/filtrar e escolher o estado. */}
      <SecaoCategoria
        categorias={nomesSecoes}
        ativa={ativa}
        aoSelecionar={selecionarPilha}
      />

      {carregando ? (
        <EsqueletoCardapio />
      ) : erro !== null ? (
        <AlertaErro
          mensagem={erro}
          aoTentarNovamente={estado.buscarNovamente}
          aoUsarDemonstracao={estado.usarDemonstracao}
        />
      ) : secoes.length === 0 ? (
        <EstadoVazio
          titulo="Nada por aqui… ainda."
          mensagem={
            vazioPorBusca
              ? "Nenhum doce bate com essa busca. Tente outra palavra."
              : "A confeitaria ainda não publicou nada. Volte em instantes."
          }
          textoAcao={vazioPorBusca ? "Limpar busca" : "Atualizar cardápio"}
          aoAgir={vazioPorBusca ? aoLimparBusca : estado.atualizarCardapio}
          // O spinner é da ação que está rodando: buscar o cardápio é rede e
          // demora, limpar a busca é instantâneo. A condição estava
          // invertida — girava no caso rápido e ficava parada no lento.
          carregando={!vazioPorBusca && atualizando}
        />
      ) : (
        <GradeCardapio
          destaque={destaque}
          secoes={renderizadas}
          quantidades={quantidades}
          aoAdicionar={adicionarComAviso}
          aoAlterarQuantidade={alterarComAviso}
          aoRemover={aoRemover}
        />
      )}
    </main>
  );
}
