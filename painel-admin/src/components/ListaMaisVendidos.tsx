import type { ProdutoVendido } from "../types";
import { VazioLista } from "./ui/VazioLista";

// Ranking de vendas (GET /admin/mais-vendidos). Vazio não é erro: loja nova
// ainda não vendeu — mensagem orienta em vez de tabela vazia.
// Sem barras, sem disco de número: lista numerada de ledger, posição em
// tabular textoSuave, volume à direita.
export function ListaMaisVendidos({ itens }: { itens: ProdutoVendido[] }): JSX.Element {
  return (
    <section>
      <h2 className="text-base font-semibold text-tinta">Mais vendidos</h2>
      {itens.length === 0 ? (
        <VazioLista
          className="mt-2"
          texto="Sem vendas ainda. O ranking aparece no primeiro pedido entregue."
        />
      ) : (
        <ol className="divide-y divide-borda">
          {itens.map((item, indice) => (
            <li
              key={item.id}
              className="flex min-h-12 items-center justify-between gap-3 py-1.5"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-5 flex-none text-right font-numero text-sm tabular-nums text-textoSuave">
                  {indice + 1}
                </span>
                <span className="min-w-0 truncate text-sm text-tinta">{item.nome}</span>
              </span>
              <span className="flex-none font-numero text-sm font-medium tabular-nums text-tinta">
                {item.total_vendido} un.
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
