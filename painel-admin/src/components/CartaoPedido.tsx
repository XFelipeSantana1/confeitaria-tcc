import { formatarMoeda } from "../lib/formatarMoeda";
import { formatarQuando } from "../lib/formatarData";
import { rotuloStatus, TOM_ESTADO } from "../lib/pedido";
import type { Pedido } from "../types";
import { Estado } from "./ui/Badge";

// Um pedido como LINHA DE LISTA — o formato do celular (5.2), no peso do
// ledger e não de cartão: 1ª linha = cliente + total à direita (Manrope
// tabular); 2ª = Estado + quando à direita (textoSuave). A linha inteira é
// clicável (vira <button>, não <li> com onClick) para o dedo abrir o detalhe
// sem precisar acertar um alvo pequeno. O whatsapp mora no drawer.
interface PropriedadesCartaoPedido {
  pedido: Pedido;
  aoAbrir: (pedido: Pedido) => void;
}

export function CartaoPedido({ pedido, aoAbrir }: PropriedadesCartaoPedido): JSX.Element {
  return (
    <li>
      <button
        onClick={() => aoAbrir(pedido)}
        className="flex min-h-16 w-full flex-col justify-center gap-0.5 border-b border-borda py-2 text-left transition-colors hover:bg-areia/50"
      >
        <span className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 truncate font-medium text-tinta">
            {pedido.cliente_nome ?? "Cliente"}
          </span>
          <b className="flex-none font-numero text-sm font-semibold tabular-nums text-tinta">
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
      </button>
    </li>
  );
}
