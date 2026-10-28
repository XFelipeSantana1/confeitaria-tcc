import type { Insumo } from "../types";

// Insumos no limite (atual ≤ mínima) — só renderiza quando há o que repor
// (quando não há, a linha da fila já diz "estoque baixo: 0"). Cada linha
// mostra o quanto falta para o mínimo: a dona decide a compra sem abrir
// outra tela. "restam" em alerta; o mínimo fica em textoSuave.
export function ListaBaixoEstoque({ itens }: { itens: Insumo[] }): JSX.Element {
  return (
    <ul aria-label="Insumos abaixo do mínimo" className="divide-y divide-borda">
      {itens.map((item) => (
        <li key={item.id} className="flex min-h-14 items-center justify-between gap-3 md:min-h-12">
          <span className="min-w-0 truncate text-sm text-tinta">{item.nome}</span>
          <span className="flex-none font-numero text-sm tabular-nums">
            <span className="text-alerta">
              restam {item.quantidade_atual} {item.unidade_medida}
            </span>
            <span className="text-textoSuave">
              {" "}
              · mín. {item.quantidade_minima} {item.unidade_medida}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
