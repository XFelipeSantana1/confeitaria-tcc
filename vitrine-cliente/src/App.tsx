import { useEffect, useMemo, useState } from "react";
import { useCardapio } from "./hooks/useCardapio";
import { useCarrinho } from "./hooks/useCarrinho";
import { useAviso } from "./hooks/useAviso";
import { usePedidoWhats } from "./hooks/usePedidoWhats";
import { BarraSacola } from "./components/BarraSacola";
import { Cabecalho } from "./components/Cabecalho";
import { Abertura } from "./components/Abertura";
import { Destaques } from "./components/Destaques";
import { SecaoCardapio } from "./components/SecaoCardapio";
import { Rodape } from "./components/Rodape";
import { Camadas } from "./components/Camadas";

// Orquestra a vitrine: busca dados, guarda filtros e abre/fecha painéis.
// Regra de negócio mora nos hooks/lib — aqui só composição e estado de tela.
export default function App(): JSX.Element {
  const cardapio = useCardapio();
  const { produtos, categorias, buscarNovamente } = cardapio;
  const { itens, adicionarVarios, remover, alterarQuantidade, total, unidades, quantidades } =
    useCarrinho(produtos);
  const { aviso, mostrarAviso } = useAviso();

  const [termoBusca, definirBusca] = useState("");
  const [sacolaAberta, definirSacolaAberta] = useState(false);
  const [configAberto, definirConfigAberto] = useState(false);
  const [ajudaAberta, definirAjudaAberta] = useState(false);
  const [nomeCliente, definirNome] = useState("");
  const [observacao, definirObservacao] = useState("");

  // Depois dos estados de formulário de propósito: o hook só precisa dos
  // valores deles, e antes da declaração o `const` nem existiria.
  const { finalizar: finalizarNoWhats } = usePedidoWhats(
    itens,
    nomeCliente,
    observacao,
    mostrarAviso,
  );

  // Só a busca filtra aqui (case-insensitive); agrupar por categoria e
  // navegar entre seções é papel da SecaoCardapio (scroll-spy).
  const buscados = useMemo(() => {
    const termo = termoBusca.trim().toLowerCase();
    if (termo === "") return produtos;
    return produtos.filter((produto) =>
      `${produto.nome} ${produto.descricao}`.toLowerCase().includes(termo),
    );
  }, [produtos, termoBusca]);

  // Falha na recarga silenciosa vira balão, não tela de erro: o cardápio
  // continua na tela (dado velho é melhor que tela vazia), mas o cliente
  // precisa saber que o que vê não é o mais novo.
  useEffect(() => {
    if (cardapio.falhaNaAtualizacao !== null) {
      // A mensagem real entra no balão: ela diz se a API caiu, se o endereço
      // está errado ou se foi a rede. "Toque em atualizar" repetia a mesma
      // frase para três causas diferentes e não ajudava a diagnosticar nada.
      mostrarAviso(
        `Mostrando o cardápio salvo — ${cardapio.falhaNaAtualizacao} Toque em atualizar.`,
      );
    }
  }, [cardapio.falhaNaAtualizacao, mostrarAviso]);

  // Fecha a sacola e leva de volta ao cardápio (usado pelo vazio que convida).
  function verCardapio(): void {
    definirSacolaAberta(false);
    document
      .getElementById("cardapio")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Mudou o endereço da API: a recarga aqui é a "de verdade", com esqueleto,
  // porque o cardápio atual pode ser de outro servidor.
  function salvarConfiguracoes(): void {
    definirConfigAberto(false);
    buscarNovamente();
  }

  return (
    // Com estoque na sacola, o espaço de descanso da barra fixa morre DENTRO
    // do rodapé dark (prop `espacoParaSacola`) e não aqui como padding do
    // root: padding no root virava uma faixa creme vazia DEPOIS do rodapé
    // escuro quando havia itens. Aí o "espaço sobrando no fim da página".
    // `min-h-dvh` (nunca a unidade fixa de viewport): em celular com barra de
    // navegador, a altura cheia chuta além do que se vê e cria rolagem fantasma.
    <div id="topo" className="min-h-dvh bg-creme font-corpo text-tinta">
      <Cabecalho
        termoBusca={termoBusca}
        aoMudarBusca={definirBusca}
        unidadesSacola={unidades}
        aoAbrirSacola={() => definirSacolaAberta(true)}
      />

      <Abertura aoComoFunciona={() => definirAjudaAberta(true)} />

      <Destaques />

      <SecaoCardapio
        produtos={buscados}
        categorias={categorias}
        buscaAtiva={termoBusca.trim() !== ""}
        estado={cardapio}
        quantidades={quantidades}
        aoAdicionarVarios={adicionarVarios}
        aoMostrarAviso={mostrarAviso}
        aoAlterarQuantidade={alterarQuantidade}
        aoRemover={remover}
        aoLimparBusca={() => definirBusca("")}
      />

      <Rodape
        secoes={categorias}
        aoAbrirConfiguracoes={() => definirConfigAberto(true)}
        espacoParaSacola={unidades > 0}
      />

      <Camadas
        sacolaAberta={sacolaAberta}
        itens={itens}
        total={total}
        nomeCliente={nomeCliente}
        observacao={observacao}
        configAberto={configAberto}
        ajudaAberta={ajudaAberta}
        aviso={aviso}
        aoFecharSacola={() => definirSacolaAberta(false)}
        aoMudarNome={definirNome}
        aoMudarObservacao={definirObservacao}
        aoAlterarQuantidade={alterarQuantidade}
        aoRemover={remover}
        aoFinalizar={finalizarNoWhats}
        aoVerCardapio={verCardapio}
        aoFecharConfiguracoes={() => definirConfigAberto(false)}
        aoSalvarConfiguracoes={salvarConfiguracoes}
        aoFecharAjuda={() => definirAjudaAberta(false)}
      />

      <BarraSacola
        unidades={unidades}
        total={total}
        aoAbrir={() => definirSacolaAberta(true)}
      />
    </div>
  );
}
