import { X } from "lucide-react";
import { rotuloStatus, TOM_ESTADO } from "../lib/pedido";
import { Estado } from "./ui/Badge";

// Topo do drawer (5.2): número em DM Sans (não serifada — título de página
// é coisa de página; drawer é ferramenta) + Estado marcador+texto. Fechar:
// no celular o drawer é tela cheia e sai como página — botão "Voltar" em
// TEXTO à esquerda; no desktop, X de 44px à direita, sobre o painel.
interface PropriedadesCabecalhoDrawer {
  pedidoId: number;
  status: string | null;
  aoFechar: () => void;
}

export function CabecalhoDrawer({
  pedidoId,
  status,
  aoFechar,
}: PropriedadesCabecalhoDrawer): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-borda p-5">
      <button
        onClick={aoFechar}
        className="-ml-2 flex-none rounded-campo px-2 text-sm font-medium text-carameloForte hover:underline underline-offset-4 md:hidden"
        aria-label="Voltar para a lista de pedidos"
      >
        Voltar
      </button>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold text-tinta">Pedido #{pedidoId}</h3>
        {status ? (
          <Estado tom={TOM_ESTADO[status] ?? "suave"} className="mt-1">
            {rotuloStatus(status)}
          </Estado>
        ) : null}
      </div>
      <button
        onClick={aoFechar}
        aria-label="Fechar detalhe"
        className="hidden h-11 w-11 flex-none place-items-center rounded-campo transition-colors hover:bg-areia/60 md:grid"
      >
        <X size={19} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}
