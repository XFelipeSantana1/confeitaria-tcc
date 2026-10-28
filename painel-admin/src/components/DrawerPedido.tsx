import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { DetalhePedido } from "../types";
import { ErroApi, obterPedido } from "../lib/api";
import { proximoStatus, rotuloStatus } from "../lib/pedido";
import { STATUS_PEDIDO } from "../types";
import { ItensPedido } from "./ItensPedido";
import { AcoesPedido } from "./AcoesPedido";
import { CabecalhoDrawer } from "./CabecalhoDrawer";

// Drawer lateral do pedido (5.2): painel branco à direita no desktop
// (rounded-l-card, border-l, shadow-flutuante), tela cheia no celular.
// Busca o detalhe ao abrir e coordena as ações (cada uma trava clique duplo
// e mostra erro sem fechar o drawer).
interface PropriedadesDrawerPedido {
  pedidoId: number | null;
  token: string;
  aoFechar: () => void;
  aoMudarStatus: (id: number, status: string) => Promise<void>;
  aoMudarPagamento: (id: number, status: string) => Promise<void>;
}

// Os passos que o fluxo mostra em texto. "cancelado" fica fora: terminador,
// não passo — quem cancela lê o Estado "Cancelado" no cabeçalho.
const FLUXO_VISIVEL = STATUS_PEDIDO.filter((status) => status !== "cancelado");

export function DrawerPedido({
  pedidoId,
  token,
  aoFechar,
  aoMudarStatus,
  aoMudarPagamento,
}: PropriedadesDrawerPedido): JSX.Element | null {
  const [detalhe, definirDetalhe] = useState<DetalhePedido | null>(null);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);
  const [agindo, definirAgindo] = useState(false);

  // Busca o detalhe quando um pedido é selecionado (efeito por seleção).
  //
  // O `AbortController` não é decoração: abrir o pedido #5 e logo o #6 fazia a
  // primeira consulta voltar depois e o drawer pintar os dados do #5 com o
  // título "Pedido #6". O cleanup do efeito roda antes do próximo efeito, mas
  // o fetch já tinha disparado — quem precisa se descartar é a própria
  // resposta, e abortar é o jeito de dizer isso ao navegador.
  useEffect(() => {
    if (pedidoId === null) {
      definirDetalhe(null);
      definirErro(null);
      definirCarregando(false);
      return;
    }
    const cancelamento = new AbortController();
    async function buscar(): Promise<void> {
      definirCarregando(true);
      definirErro(null);
      try {
        definirDetalhe(await obterPedido(token, pedidoId as number, cancelamento.signal));
      } catch (falha) {
        if (cancelamento.signal.aborted) return;
        definirErro(falha instanceof Error ? falha.message : "Não foi possível abrir o pedido.");
      } finally {
        if (!cancelamento.signal.aborted) definirCarregando(false);
      }
    }
    buscar();
    return () => cancelamento.abort();
  }, [pedidoId, token]);

  useEffect(() => {
    if (pedidoId === null) return;
    function aoTeclar(evento: KeyboardEvent): void {
      if (evento.key === "Escape") aoFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [pedidoId, aoFechar]);

  if (pedidoId === null) return null;

  async function agir(
    acao: () => Promise<void>,
    recarregar: (detalhe: DetalhePedido) => DetalhePedido,
  ): Promise<void> {
    definirAgindo(true);
    definirErro(null);
    try {
      await acao();
      definirDetalhe((atual) => (atual ? recarregar(atual) : atual));
    } catch (falha) {
      definirErro(falha instanceof ErroApi ? falha.message : "A ação falhou. Tente de novo.");
    } finally {
      definirAgindo(false);
    }
  }

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="Detalhe do pedido"
      className="fixed inset-0 z-[61] flex animate-[deslizar_0.35s_cubic-bezier(0.32,0.72,0,1)] flex-col bg-white text-tinta shadow-flutuante md:inset-y-0 md:left-auto md:right-0 md:w-full md:max-w-md md:rounded-l-card md:border-l md:border-borda"
    >
      <CabecalhoDrawer
        pedidoId={pedidoId}
        status={detalhe?.status ?? null}
        aoFechar={aoFechar}
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        {carregando ? (
          <p className="flex items-center gap-2 py-10 text-sm text-textoSuave">
            <Loader2 size={18} strokeWidth={1.5} className="motion-safe:animate-spin" aria-hidden="true" /> Abrindo pedido…
          </p>
        ) : erro && !detalhe ? (
          <p role="alert" className="rounded-campo bg-areia px-3 py-2 text-sm font-semibold text-carameloForte">
            {erro}
          </p>
        ) : detalhe ? (
          <>
            {/* Fluxo em UMA linha de texto: onde o pedido está nessas quatro
                etapas, sem bolinhas nem caixinhas. O atual é semibold + traço
                caramelo; o resto é textoSuave — a cor é do marcador de estado,
                não de enfeite. */}
            <div
              aria-label="Fluxo do pedido"
              className="flex flex-wrap items-center gap-x-1.5 gap-y-1 border-b border-borda pb-3 text-xs"
            >
              {FLUXO_VISIVEL.map((status, indice) => (
                <span key={status} className="flex items-center gap-x-1.5">
                  {indice > 0 ? (
                    <span aria-hidden="true" className="text-textoSuave">
                      →
                    </span>
                  ) : null}
                  <span
                    className={`relative py-0.5 ${
                      status === detalhe.status
                        ? "font-semibold text-tinta"
                        : "text-textoSuave"
                    }`}
                  >
                    {rotuloStatus(status)}
                    {status === detalhe.status ? (
                      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-caramelo" />
                    ) : null}
                  </span>
                </span>
              ))}
            </div>
            <ItensPedido
              detalhe={detalhe}
              desabilitado={agindo}
              aoTrocarPagamento={(valor) =>
                agir(
                  () => aoMudarPagamento(detalhe.id, valor),
                  (atual) => ({ ...atual, status_pagamento: valor }),
                )
              }
            />
            {erro ? (
              <p role="alert" className="rounded-campo bg-areia px-3 py-2 text-sm font-semibold text-carameloForte">
                {erro}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      {detalhe && !carregando ? (
        <AcoesPedido
          detalhe={detalhe}
          agindo={agindo}
          aoAvancar={() => {
            const proximo = proximoStatus(detalhe.status);
            if (proximo) {
              agir(
                () => aoMudarStatus(detalhe.id, proximo),
                (atual) => ({ ...atual, status: proximo }),
              );
            }
          }}
          aoCancelar={() =>
            agir(
              () => aoMudarStatus(detalhe.id, "cancelado"),
              (atual) => ({ ...atual, status: "cancelado" }),
            )
          }
        />
      ) : null}
    </aside>
  );
}
