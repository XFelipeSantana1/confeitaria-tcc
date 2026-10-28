import { Busca } from "./Busca";

/**
 * Busca com o contador "#26 insumos" ao lado (5.4).
 *
 * O contador não é enfeite: sem ele, uma lista que cai para zero depois da
 * busca parece que os dados sumiram, e não que o termo não bateu. Sem busca
 * ativa é o total da lista; buscando, o "de" informa o recorte.
 */
export function BuscaComContagem({
  valor,
  aoMudar,
  placeholder,
  rotulo,
  encontrados,
  total,
  palavra,
}: {
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder: string;
  rotulo: string;
  encontrados: number;
  total: number;
  /** Plural do que a lista guarda ("insumos", "produtos"). */
  palavra: string;
}): JSX.Element {
  const buscando = valor.trim() !== "";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Busca
        valor={valor}
        aoMudar={aoMudar}
        placeholder={placeholder}
        rotulo={rotulo}
      />
      <p className="font-numero text-sm tabular-nums text-textoSuave">
        {buscando ? `${encontrados} de ${total} ${palavra}` : `${total} ${palavra}`}
      </p>
    </div>
  );
}
