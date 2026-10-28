import { formatarMoeda } from "../lib/formatarMoeda";
import { formatarQuando } from "../lib/formatarData";
import { rotuloStatus, TOM_ESTADO } from "../lib/pedido";
import type { Pedido } from "../types";
import { Estado } from "./ui/Badge";

// Tabela de pedidos do desktop (5.2): LEDGER sobre o creme, sem caixa —
// header em rótulo-caixa com hairline, linhas com hairline e hover areia.
// Abaixo de `md` quem manda é a linha de lista (CartaoPedido): a tabela
// tinha 640px de largura mínima, ou seja, 288px de rolagem lateral num
// celular de 360px.
//
// A linha inteira é clicável e abre o drawer de detalhe — por isso o
// cursor-pointer e o hover. Números em Manrope tabular; total e quando
// alinhados à direita. O whatsapp mora no drawer: repetir aqui apertava
// a coluna de "# + nome" (a lista da 5.2 não exibe, e o comportamento
// de abrir para ver continuou igual).
interface PropriedadesTabelaPedidos {
  pedidos: Pedido[];
  aoAbrir: (pedido: Pedido) => void;
}

export function TabelaPedidos({ pedidos, aoAbrir }: PropriedadesTabelaPedidos): JSX.Element {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-borda text-xs font-semibold uppercase tracking-wider text-textoSuave">
            <th className="px-4 py-3">Pedido</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Quando</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr
              key={pedido.id}
              onClick={() => aoAbrir(pedido)}
              className="cursor-pointer border-b border-borda transition-colors last:border-0 hover:bg-areia/50"
            >
              <td className="px-4 py-3">
                <span className="font-numero font-semibold tabular-nums text-tinta">#{pedido.id}</span>
                <span className="block text-xs text-textoSuave">
                  {pedido.cliente_nome ?? "Cliente"}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-numero font-semibold tabular-nums text-tinta">
                {formatarMoeda(pedido.valor_total)}
              </td>
              <td className="px-4 py-3">
                <Estado tom={TOM_ESTADO[pedido.status] ?? "suave"}>
                  {rotuloStatus(pedido.status)}
                </Estado>
              </td>
              <td className="px-4 py-3 text-right font-numero text-xs tabular-nums text-textoSuave">
                {formatarQuando(pedido.criado_em)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
