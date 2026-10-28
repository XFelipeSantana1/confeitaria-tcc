import { Loader2, RefreshCw } from "lucide-react";

// Título do cardápio, contador e o botão de recarregar. Separado para a seção
// principal cuidar só de agrupar e navegar, não de apresentar o cabeçalho.
interface PropriedadesCabecalhoCardapio {
  totalExibido: number;
  carregando: boolean;
  atualizando: boolean;
  modoDemonstracao: boolean;
  aoAtualizar: () => void;
}

export function CabecalhoCardapio({
  totalExibido,
  carregando,
  atualizando,
  modoDemonstracao,
  aoAtualizar,
}: PropriedadesCabecalhoCardapio): JSX.Element {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-tinta text-balance md:text-4xl">
          Nosso cardápio
        </h2>
        {/* Contador ÚNICO: havia um número aqui e, do lado, uma frase
            "Mostrando N delícia(s) fresquinha(s)" — o mesmo dado dito duas
            vezes. O que a cliente precisa aparece uma vez, em Manrope
            tabular: onde está a lista e quantas opções tem. */}
        <p className="mt-1 font-numero text-sm font-semibold tabular-nums text-textoSuave">
          {carregando
            ? "carregando…"
            : `${totalExibido} ${totalExibido === 1 ? "doce" : "doces"}${
                modoDemonstracao ? " · demonstração" : ""
              }`}
        </p>
      </div>

      {/* Recarrega discreto: icon-button com hairline. Saiu o pulinho de
          hover (`-translate-y-0.5`), que chamava atenção para uma ação de
          fundo. Vira spinner no lugar do ícone enquanto busca. */}
      <button
        onClick={aoAtualizar}
        disabled={atualizando}
        aria-label="Atualizar o cardápio"
        title={
          atualizando
            ? "Atualizando…"
            : "Atualizar o cardápio (também acontece sozinho ao voltar para esta aba)"
        }
        aria-busy={atualizando}
        className="grid h-11 w-11 flex-none place-items-center rounded-campo border border-borda bg-white text-tinta transition-colors hover:bg-areia/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo/40 disabled:cursor-progress disabled:opacity-70"
      >
        {atualizando ? (
          <Loader2 size={17} strokeWidth={1.5} className="motion-safe:animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw size={17} strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
