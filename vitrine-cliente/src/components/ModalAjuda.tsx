import { X } from "lucide-react";

// Explica o pedido em 3 passos. Separado do App para o App não virar um
// arquivo gigante — mesma regra dos outros componentes pequenos.
interface PropriedadesModalAjuda {
  aberto: boolean;
  aoFechar: () => void;
}

export function ModalAjuda({ aberto, aoFechar }: PropriedadesModalAjuda): JSX.Element | null {
  if (!aberto) return null;
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-tinta/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Como funciona"
    >
      <div className="w-full max-w-md rounded-card bg-white p-6 text-tinta shadow-flutuante max-h-dvh overflow-y-auto overscroll-contain">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-balance">Como funciona</h3>
          <button
            onClick={aoFechar}
            aria-label="Fechar ajuda"
            className="grid h-11 w-11 flex-none place-items-center rounded-campo border border-borda bg-white transition-colors hover:bg-areia focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo/40"
          >
            <X size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <ol className="flex list-none flex-col gap-3 p-0 font-corpo text-sm leading-relaxed text-pretty">
          <li>
            <b className="font-semibold">1.</b> Toque em <b className="font-semibold">+</b> nos doces que você quer.
          </li>
          <li>
            <b className="font-semibold">2.</b> Abra a <b className="font-semibold">sacola</b>, confira e diga seu nome.
          </li>
          <li>
            <b className="font-semibold">3.</b> Toque em <b className="font-semibold">Finalizar no WhatsApp</b> — a mensagem já vai
            prontinha, é só enviar.
          </li>
        </ol>
      </div>
    </div>
  );
}
