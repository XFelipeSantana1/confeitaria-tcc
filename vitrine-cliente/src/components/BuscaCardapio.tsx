import { Search, X } from "lucide-react";

/**
 * Campo de busca do cardápio.
 *
 * Componente próprio porque aparece em dois lugares com larguras diferentes — na
 * barra do cabeçalho, do lado do logo no desktop, e em uma linha inteira abaixo
 * dela no celular. Duplicar o `<input>` significaria duplicar o `aria-label` e o
 * `type="search"`, e foi exatamente o que aconteceu antes: no celular não havia
 * busca nenhuma, só as pílulas de categoria, porque a barra já estava cheia.
 */
export function BuscaCardapio({
  termo,
  aoMudar,
  className = "",
}: {
  termo: string;
  aoMudar: (termo: string) => void;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={`flex min-h-11 items-center gap-2 rounded-campo border border-borda bg-white px-3.5 py-2 transition-shadow focus-within:border-caramelo focus-within:ring-2 focus-within:ring-caramelo/40 print:hidden ${className}`}
    >
      <Search size={17} strokeWidth={1.5} className="flex-none text-textoSuave" aria-hidden="true" />
      <input
        value={termo}
        onChange={(evento) => aoMudar(evento.target.value)}
        onKeyDown={(evento) => {
          // `Esc` limpa a busca. Quem digita "pao de mel" e vê a lista inteira
          // sumir não descobre por que, e a única pista seria fechar e abrir a
          // página.
          if (evento.key === "Escape") aoMudar("");
        }}
        type="search"
        placeholder="Buscar doce…"
        aria-label="Buscar doce no cardápio"
        className="min-w-0 flex-1 bg-transparent font-corpo text-sm text-tinta focus-visible:outline-none placeholder:text-textoSuave/60"
      />
      {termo !== "" ? (
        <button
          onClick={() => aoMudar("")}
          aria-label="Limpar a busca"
          className="grid h-6 w-6 flex-none place-items-center rounded-campo text-textoSuave transition-colors hover:bg-areia hover:text-tinta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo/40"
        >
          <X size={14} strokeWidth={1.5} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}