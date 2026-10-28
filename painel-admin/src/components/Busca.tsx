import { Search, X } from "lucide-react";

/**
 * Campo de busca por texto.
 *
 * Fica em componente próprio porque as três telas que listam (produtos,
 * insumos e histórico) precisam do mesmo campo e do mesmo comportamento: limpar
 * com um clique, Esc limpa, e o rótulo acessível incluso — o campo só com
 * placeholder não diz nada para quem usa leitor de tela.
 */
interface PropriedadesBusca {
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder: string;
  /** O que está sendo filtrado, para o rótulo acessível ("Buscar insumos"). */
  rotulo: string;
}

export function Busca({ valor, aoMudar, placeholder, rotulo }: PropriedadesBusca): JSX.Element {
  return (
    // Campo único da 5.3: h-11, borda textoSuave/80 e SEM moldura de cartão
    // em volta. 16px no texto (iOS não dá zoom); a única lupa do painel é
    // esta — por isso ela tem função registrada.
    <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-campo border border-textoSuave/80 bg-white px-3.5 transition-colors focus-within:border-caramelo focus-within:ring-2 focus-within:ring-caramelo/40">
      <Search size={17} strokeWidth={1.5} className="flex-none text-textoSuave" aria-hidden="true" />
      <input
        type="search"
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key === "Escape") aoMudar("");
        }}
        placeholder={placeholder}
        aria-label={rotulo}
        className="w-full min-w-0 bg-transparent font-corpo text-base text-tinta outline-none placeholder:text-textoSuave/60"
      />
      {valor !== "" ? (
        <button
          onClick={() => aoMudar("")}
          aria-label="Limpar a busca"
          className="-mr-2 grid h-11 w-11 flex-none place-items-center rounded-campo text-textoSuave transition-colors hover:bg-areia hover:text-tinta"
        >
          <X size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
