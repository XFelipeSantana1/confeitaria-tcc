import type { DetalhePedido } from "../types";
import { formatarMoeda } from "../lib/formatarMoeda";
import { rotuloPagamento } from "../lib/pedido";
import { STATUS_PAGAMENTO } from "../types";

// Corpo do drawer: cliente, itens, total e seletor de pagamento. Recebe
// callbacks prontos — buscar e salvar continuam no DrawerPedido.
//
// Total NÃO é mais faixa escura dentro da gaveta (caixa dentro de caixa era
// exatamente o padrão do fim): é a última linha do ledger — "Total" à
// esquerda com peso maior, valor à direita em Manrope text-lg semibold
// tabular. O select de pagamento segue o padrão de campo da 3.5.
interface PropriedadesItensPedido {
  detalhe: DetalhePedido;
  desabilitado: boolean;
  aoTrocarPagamento: (valor: string) => void;
}

export function ItensPedido({
  detalhe,
  desabilitado,
  aoTrocarPagamento,
}: PropriedadesItensPedido): JSX.Element {
  return (
    <>
      {/* Cliente como ledger (hairline embaixo), não caixa dentro da gaveta. */}
      <div className="border-b border-borda pb-3 text-sm">
        <b className="block font-medium text-tinta">{detalhe.cliente_nome ?? "Cliente"}</b>
        <span className="text-textoSuave">{detalhe.whatsapp}</span>
      </div>
      <ul className="flex flex-col divide-y divide-borda text-sm">
        {detalhe.itens.map((item) => (
          <li key={item.id} className="flex items-center gap-2 py-2.5">
            <span className="min-w-0 flex-1 text-tinta">
              <b className="block font-medium">
                {item.quantidade}x {item.produto_nome}
              </b>
              <span className="font-numero text-xs text-textoSuave">
                {formatarMoeda(item.preco_unitario)} cada
              </span>
            </span>
            <b className="flex-none font-numero font-semibold tabular-nums text-tinta">
              {formatarMoeda(item.subtotal)}
            </b>
          </li>
        ))}
      </ul>
      {/* Última linha do ledger: sem caixa, sem faixa escura. */}
      <div className="flex min-h-12 items-center justify-between gap-3 border-t border-borda py-2 text-sm">
        <span className="font-semibold text-tinta">Total</span>
        <b className="font-numero text-lg font-semibold tabular-nums text-tinta">
          {formatarMoeda(detalhe.valor_total)}
        </b>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-tinta">
        Pagamento ({rotuloPagamento(detalhe.status_pagamento)})
        <select
          value={detalhe.status_pagamento}
          disabled={desabilitado}
          onChange={(evento) => aoTrocarPagamento(evento.target.value)}
          className="h-11 rounded-campo border border-textoSuave/80 bg-white px-3 font-corpo text-base text-tinta outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus:border-caramelo focus:ring-2 focus:ring-caramelo/40"
        >
          {STATUS_PAGAMENTO.map((opcao) => (
            <option key={opcao} value={opcao}>
              {rotuloPagamento(opcao)}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
