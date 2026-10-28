import { useEffect, useRef } from "react";
import { ShoppingBasket } from "lucide-react";
import { BuscaCardapio } from "./BuscaCardapio";
import { SimboloClaro } from "./Marca";

// Barra fixa do topo: marca, busca e acesso à sacola. Enxuta de propósito:
// a engrenagem de configuração saiu daqui e mora no rodapé ("trocar API /
// WhatsApp") — tarefa rara demais para um lugar permanente na barra mais
// valiosa da página.
//
// NÃO mostra o estado da API. "API online" é informação de quem desenvolve,
// não de quem quer comprar doce: a conexão quebrada já aparece onde o
// problema existe — o `AlertaErro` no lugar do cardápio e o balão "Mostrando
// o cardápio salvo" quando a recarga falha.

interface PropriedadesCabecalho {
  termoBusca: string;
  aoMudarBusca: (termo: string) => void;
  unidadesSacola: number;
  aoAbrirSacola: () => void;
}

export function Cabecalho({
  termoBusca,
  aoMudarBusca,
  unidadesSacola,
  aoAbrirSacola,
}: PropriedadesCabecalho): JSX.Element {
  // A barra publica a própria altura numa variável de CSS. A navegação de
  // categorias é `sticky` e precisa pousar logo abaixo dela — medir é mais
  // barato do que manter um número chutado certo para cada orientação.
  const referencia = useRef<HTMLElement>(null);

  useEffect(() => {
    const elemento = referencia.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([medida]) => {
      document.documentElement.style.setProperty(
        "--altura-cabecalho",
        `${Math.round(medida?.contentRect.height ?? 0)}px`,
      );
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    // Fundo SÓLIDO: o `backdrop-blur` da versão anterior colocava um vidro
    // sobre o cardápio (efeito caro de renderizar e cara de "site gerado").
    // Hairline inferior marca a borda, e basta.
    <header
      ref={referencia}
      className="sticky top-0 z-40 border-b border-borda bg-creme"
    >
      {/* `justify-between`: no celular não há busca para preencher o meio —
          os únicos filhos ficavam amontoados à esquerda, a sacola grudada
          no nome (relato de uso). Com o vão distribuído, o nome fica à
          esquerda e a sacola pousa no canto direito; no desktop a busca
          flex-1 ocupa o meio e o novo comportamento não muda nada. */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-5 py-3 sm:gap-3">
        {/* `min-w-0`: se sobrar aperto, o nome é o que encolhe — nunca os
            botões da barra. `whitespace-nowrap` passa para o lockup. */}
        <a href="#topo" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          {/* Disco sólido (sem gradiente): fundo tinta pede a versão CLARA do
              símbolo — contraste 15,3:1 contra o creme em volta. Medido, não
              suposto: a versão escura do símbolo sobre tinta era invisível. */}
          <span className="grid h-10 w-10 flex-none place-items-center rounded-card bg-tinta sm:h-11 sm:w-11">
            <SimboloClaro tamanho={26} />
          </span>
          {/* Pilha em coluna com métricas explícitas (relato de uso: o nome
              ganhava vão embaixo e desalinhava com o celular deitado). Antes
              era uma linha de bloco com subtítulo em bloco dentro — a
              Playfair transborda a própria caixa e a caixa do subtítulo
              (150% de 10px) tinha meio vão morto — e a pilha inteira
              centrava "de olho" contra o disco, sobrando espaço por baixo.
              Coluna com `leading-none` nas duas linhas e um único vão fixo
              (mt-1): o disco e o nome alinham pelo centro de pé ou deitado.
              `whitespace-nowrap` no invólucro vale para as duas linhas. */}
          <span className="flex min-w-0 flex-col whitespace-nowrap">
            <span className="font-display text-base font-bold leading-none sm:text-lg md:text-xl">
              Doce<em className="text-caramelo">&amp;</em> Carinho
            </span>
            <span className="mt-1 font-corpo text-[10px] font-semibold leading-none tracking-[0.14em] text-textoSuave uppercase">
              confeitaria artesanal
            </span>
          </span>
        </a>

        {/* No desktop a busca ocupa o vão entre a marca e a sacola. */}
        <BuscaCardapio
          termo={termoBusca}
          aoMudar={aoMudarBusca}
          className="hidden min-w-0 flex-1 md:flex"
        />

        {/* `min-h-11` = 44px: alvo de toque mínimo no celular. Borda de corte
            + prensa de 1px, como todos os botões de compra; em impressão fica
            fora (quem imprime quer a lista de doces, não a sacola). */}
        <button
          onClick={aoAbrirSacola}
          aria-label={`Abrir sacola com ${unidadesSacola} itens`}
          className="flex min-h-11 flex-none items-center gap-2 rounded-campo border-b-2 border-carameloEscuro bg-carameloForte px-4 font-corpo text-sm font-semibold text-white transition-colors hover:bg-carameloEscuro active:translate-y-px print:hidden sm:px-5"
        >
          <ShoppingBasket size={18} strokeWidth={1.5} aria-hidden="true" />
          <span className="hidden sm:inline">Sacola</span>
          {/* Número sem pulo (relato de uso: o número crescer a cada adição
              era exagero — e o scale(1.45) balançava de verdade). A
              confirmação do doce que entrou mora no balão "Adicionado à
              sacola"; o contador só precisa ser confiável: muda de valor, e
              pronto. Contador em creme sobre terracota — branco puro sobre
              caramelo puro ficaria abaixo de AA. */}
          <b
            className="grid h-6 min-w-6 flex-none place-items-center rounded-campo bg-creme px-1.5 font-numero text-xs font-semibold tabular-nums text-tinta"
          >
            {unidadesSacola}
          </b>
        </button>
      </div>

      {/* Busca em uma linha inteira, só no celular. Dentro do cabeçalho (e não
          depois dele) para continuar alcançável depois de rolar. O
          ResizeObserver acima mede esta linha junto, então a navegação de
          categorias continua pousando na altura certa sem número chutado. */}
      <div className="px-5 pb-3 md:hidden print:hidden">
        <BuscaCardapio termo={termoBusca} aoMudar={aoMudarBusca} />
      </div>
    </header>
  );
}
