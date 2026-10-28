import { ArrowRight } from "lucide-react";
import type { DetalhePedido } from "../types";
import { proximoStatus, rotuloStatus } from "../lib/pedido";
import { Botao } from "./ui/Botao";

// Rodapé fixo do drawer (5.2): avançar no fluxo e cancelar (com estorno).
// Sem próximo (entregue/cancelado) não há botão de avanço; entregue também
// esconde o cancelar — decisão visível aqui, não espalhada.
//
// "Cancelar pedido" fica à ESQUERDA como ação em texto/perigo: cancelar não
// compete em peso com o avanço, que é o trabalho do dia. Ícones saíram —
// a palavra já diz a ação; o confirmão continua morando no
// ModalConfirmacao, como antes.
interface PropriedadesAcoesPedido {
  detalhe: DetalhePedido;
  agindo: boolean;
  aoAvancar: () => void;
  aoCancelar: () => void;
}

export function AcoesPedido({
  detalhe,
  agindo,
  aoAvancar,
  aoCancelar,
}: PropriedadesAcoesPedido): JSX.Element | null {
  const proximo = proximoStatus(detalhe.status);
  const podeCancelar = detalhe.status !== "cancelado" && detalhe.status !== "entregue";
  if (!proximo && !podeCancelar) return null;
  return (
    <div className="flex items-center gap-3 border-t border-borda bg-white p-4">
      {podeCancelar ? (
        <Botao
          variante="perigo"
          disabled={agindo}
          onClick={aoCancelar}
          className="flex-none"
          title="Cancela e estorna o estoque"
        >
          Cancelar pedido
        </Botao>
      ) : null}
      {proximo ? (
        <Botao disabled={agindo} onClick={aoAvancar} className="flex-1">
          {agindo ? "Salvando…" : `Avançar para ${rotuloStatus(proximo)}`}
          {/* A seta é a DIREÇÃO do fluxo (a própria ação é "avançar"): quem
              toca sabe para onde o pedido vai sem ler duas vezes. */}
          {!agindo ? <ArrowRight size={17} strokeWidth={1.5} aria-hidden="true" /> : null}
        </Botao>
      ) : null}
    </div>
  );
}
