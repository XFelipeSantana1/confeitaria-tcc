import { useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import type { ItemCarrinho } from "../types";
import { formatarMoeda } from "../lib/formatarMoeda";
import { Botao } from "./ui/Botao";
import { ItemSacola } from "./ItemSacola";

// Gaveta lateral da sacola: tela inteira no celular, painel de 420px no
// desktop. Fecha no Escape e no clique fora (overlay do App). A ÚNICA sombra
// do site é a de gaveta/modal — e dentro dela não há cartão (superfície
// dentro de superfície): linhas e rodapé se separam por hairline.
interface PropriedadesCarrinhoDrawer {
  aberto: boolean;
  itens: ItemCarrinho[];
  total: number;
  nomeCliente: string;
  observacao: string;
  aoMudarNome: (nome: string) => void;
  aoMudarObservacao: (observacao: string) => void;
  aoAlterarQuantidade: (produtoId: number, diferenca: number) => void;
  aoRemover: (produtoId: number) => void;
  aoFechar: () => void;
  aoFinalizar: () => void;
  aoVerCardapio: () => void;
}

export function CarrinhoDrawer({
  aberto,
  itens,
  total,
  nomeCliente,
  observacao,
  aoMudarNome,
  aoMudarObservacao,
  aoAlterarQuantidade,
  aoRemover,
  aoFechar,
  aoFinalizar,
  aoVerCardapio,
}: PropriedadesCarrinhoDrawer): JSX.Element | null {
  // Escape fecha só quando aberta (evita roubar o atalho do resto do site).
  useEffect(() => {
    if (!aberto) return;
    function aoTeclar(evento: KeyboardEvent): void {
      if (evento.key === "Escape") aoFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  // O total mora no rodapé; aqui em cima fica só a contagem de itens.
  const unidades = itens.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="Sacola de pedidos"
      className="fixed inset-y-0 right-0 z-[61] flex max-h-dvh w-full motion-safe:animate-[deslizar_0.35s_cubic-bezier(0.32,0.72,0,1)] flex-col border-l border-borda bg-white text-tinta shadow-flutuante sm:max-w-[420px] print:hidden"
    >
      {/* Hairline sólida (a tracejada era ruído); sem ícone no título. */}
      <div className="flex items-start justify-between gap-2 border-b border-borda p-5">
        <div>
          <h3 className="font-display text-2xl font-bold">Sua sacola</h3>
          <p className="mt-1 font-numero text-[13px] font-semibold tabular-nums text-textoSuave">
            {unidades === 0
              ? "Nada aqui ainda"
              : `${unidades} ${unidades === 1 ? "item" : "itens"}`}
          </p>
        </div>
        <button
          onClick={aoFechar}
          aria-label="Fechar sacola"
          className="grid h-11 w-11 flex-none place-items-center rounded-campo border border-borda bg-white transition-colors hover:bg-areia focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo/40"
        >
          <X size={19} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {/* Linhas por hairline (divide-y), sem caixa em volta de cada item.
          `overscroll-contain`: rolar até o fim da gaveta não puxa a página
          de trás (efeito elástico que empurra o cardápio). */}
      <div className="flex-1 divide-y divide-borda overflow-y-auto overscroll-contain px-5">
        {itens.length === 0 ? (
          <div className="px-2 py-12 text-center">
            {/* Sem disco com ícone: o texto explica e oferece o caminho. */}
            <b className="block font-display text-2xl font-bold text-tinta">
              Sacola vazia
            </b>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-textoSuave">
              Escolha seus doces no cardápio — tem um destaque da casa logo no
              começo da lista.
            </p>
            <div className="mt-5">
              <Botao variante="clara" onClick={aoVerCardapio}>
                Ver cardápio
              </Botao>
            </div>
          </div>
        ) : (
          itens.map((item) => (
            <ItemSacola
              key={item.produto.id}
              item={item}
              aoAlterarQuantidade={aoAlterarQuantidade}
              aoRemover={aoRemover}
            />
          ))
        )}
      </div>

      {/* Rodapé fixo fora da rolagem: finalizar sempre visível. Hairline
          superior em vez de cartão (superfície dentro de superfície). */}
      <div className="border-t border-borda p-5">
        <div className="flex flex-col gap-2.5">
          <label className="flex flex-col gap-1 text-xs font-semibold text-textoSuave">
            Seu nome
            <input
              value={nomeCliente} onChange={(evento) => aoMudarNome(evento.target.value)}
              placeholder="Ex: Maria" autoComplete="name"
              className="min-h-11 rounded-campo border border-textoSuave/80 bg-white px-3.5 font-corpo text-sm font-normal text-tinta transition-colors focus:border-caramelo focus:ring-2 focus:ring-caramelo/40 focus-visible:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-textoSuave">
            Observações
            <input
              value={observacao} onChange={(evento) => aoMudarObservacao(evento.target.value)}
              placeholder="Ex: sem granulado no segundo cone"
              className="min-h-11 rounded-campo border border-textoSuave/80 bg-white px-3.5 font-corpo text-sm font-normal text-tinta transition-colors focus:border-caramelo focus:ring-2 focus:ring-caramelo/40 focus-visible:outline-none"
            />
          </label>
          {/* O número da gaveta: Manrope tabular, sem enfeite — caramelo
              fica para a ação. */}
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-corpo text-sm text-textoSuave">Total</span>
            <b className="font-numero text-2xl font-semibold tabular-nums text-tinta">
              {formatarMoeda(total)}
            </b>
          </div>
          <Botao variante="whats" onClick={aoFinalizar} className="w-full py-4 text-base">
            <MessageCircle size={20} strokeWidth={1.5} aria-hidden="true" /> Finalizar no WhatsApp
          </Botao>
          {/* Sem cadeado nem ícone: a frase curta É a garantia. */}
          <p className="text-center text-xs text-textoSuave">
            Você confirma o pagamento direto na conversa.
          </p>
        </div>
      </div>
    </aside>
  );
}
