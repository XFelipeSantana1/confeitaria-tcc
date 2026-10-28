import { Link } from "react-router-dom";
import type { Pedido } from "../types";
import { rotuloStatus, TOM_ESTADO } from "../lib/pedido";
import { formatarQuando } from "../lib/formatarData";
import { formatarMoeda } from "../lib/formatarMoeda";
import { Estado } from "./ui/Badge";
import { VazioLista } from "./ui/VazioLista";

// Últimos pedidos no Resumo: a LINHA da 5.2 em versão compacta (máx. 5), sem
// cartão — ledger com hairline. Rótulo-caixa é permitido aqui: "rótulo de
// seção do Resumo". "ver todos" é link de texto, não botão.
export function UltimosPedidos({ pedidos }: { pedidos: Pedido[] }): JSX.Element {
  const recentes = pedidos.slice(0, 5);
  return (
    <section aria-label="Últimos pedidos">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-textoSuave">
          Últimos pedidos
        </p>
        <Link
          to="/painel/pedidos"
          className="text-sm font-medium text-carameloForte hover:underline underline-offset-4"
        >
          ver todos
        </Link>
      </div>
      {recentes.length === 0 ? (
        <VazioLista className="mt-2" texto="Nenhum pedido ainda. O movimento da loja aparece aqui." />
      ) : (
        <ul className="mt-1 divide-y divide-borda">
          {recentes.map((pedido) => (
            <li key={pedido.id}>
              <Link
                to="/painel/pedidos"
                className="flex min-h-16 min-w-0 flex-col justify-center gap-0.5 py-2 transition-colors hover:bg-areia/50"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium text-tinta">
                    {pedido.cliente_nome ?? "Cliente"}
                  </span>
                  <b className="font-numero text-sm font-semibold tabular-nums text-tinta">
                    {formatarMoeda(pedido.valor_total)}
                  </b>
                </span>
                <span className="flex items-baseline justify-between gap-3">
                  <Estado tom={TOM_ESTADO[pedido.status] ?? "suave"}>
                    {rotuloStatus(pedido.status)}
                  </Estado>
                  <span className="flex-none font-numero text-xs tabular-nums text-textoSuave">
                    {formatarQuando(pedido.criado_em)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
