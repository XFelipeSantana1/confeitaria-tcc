import { TODAS_CATEGORIAS } from "../types";

// Abas de categoria do cardápio: TEXTO com traço caramelo na ativa — o mesmo
// desenho das AbasRodape do painel. Sem pílula preenchida e sem cartão em
// volta: cardápio impresso, não seletor de app. O sticky (que pousa abaixo
// do cabeçalho com a variável `--altura-cabecalho`) é a moldura DESTA
// componente: fixa, com hairline inferior; as abas rolam lateralmente no
// trilho com snap e com a barra de rolagem escondida (bounce era barulho).
interface PropriedadesSecaoCategoria {
  categorias: string[];
  ativa: string;
  aoSelecionar: (categoria: string) => void;
}

export function SecaoCategoria({
  categorias,
  ativa,
  aoSelecionar,
}: PropriedadesSecaoCategoria): JSX.Element {
  const opcoes = [TODAS_CATEGORIAS, ...categorias];
  return (
    <div
      className="sticky z-30 -mx-5 border-b border-borda bg-creme px-5 print:hidden"
      style={{ top: "var(--altura-cabecalho, 67px)" }}
    >
      <div
        className="flex snap-x gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Categorias"
      >
        {opcoes.map((categoria) => {
          const selecionada = ativa === categoria;
          return (
            <button
              key={categoria}
              role="tab"
              aria-selected={selecionada}
              onClick={() => aoSelecionar(categoria)}
              className={`flex-none snap-start whitespace-nowrap border-b-2 py-3 font-corpo text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo/40 ${
                selecionada
                  ? "border-caramelo text-tinta"
                  : "border-transparent text-textoSuave hover:border-borda hover:text-tinta"
              }`}
            >
              {categoria === TODAS_CATEGORIAS ? "Tudo" : categoria}
            </button>
          );
        })}
      </div>
    </div>
  );
}
