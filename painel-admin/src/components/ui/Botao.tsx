import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

// Botão do painel ("papel e tinta"). O feedback TÁTIL veio do uso: um botão
// sem corpo parece rótulo de texto. O corpo ganhou três sinais discretos:
// (1) uma "borda de corte" mais escura na base do primário — como a borda de
// um biscoito, dá peso de coisa clicável sem sombra; (2) o botão desce 1px
// ao apertar (translate-y-px) — o toque responde; (3) hover sempre ESCURECE
// o caramelo, nunca clareia.
type VarianteBotao = "primario" | "secundario" | "texto" | "perigo" | "destrutivo";

const ESTILOS: Record<VarianteBotao, string> = {
  // Primário: carameloForte com branco (6,15:1, AA) + base escura. A borda
  // inferior carameloEscuro desenfa o "corte do biscoito"; o clique desce
  // 1px. UMA ação primária por região da tela: o resto é secundário ou texto.
  primario:
    "h-11 px-5 rounded-campo bg-carameloForte text-white text-sm font-semibold border-b-2 border-carameloEscuro hover:bg-carameloEscuro active:translate-y-px",
  // Secundário: para "ver todos", "cancelar" e pares de ação na mesma linha.
  // Fundo branco com borda legível e hover areia — responde sem competir com
  // o primário.
  secundario:
    "h-11 px-4 rounded-campo border border-textoSuave/80 bg-white text-tinta font-medium hover:bg-areia/60 hover:border-borda active:translate-y-px",
  // Texto: ação embutida em prosa ("ver todos", "Tentar de novo"). Fica com
  // corpo no hover (areia) em vez de underline — alvo mais claro para o dedo.
  texto:
    "min-h-11 px-2.5 rounded-campo text-sm font-medium text-carameloForte hover:bg-areia/60 active:translate-y-px underline-offset-4",
  // Perigo: texto/borda fumegante que avisa SEM virar o botão mais forte da
  // região (cancelar pedido não deve competir com "Avançar").
  perigo:
    "min-h-11 px-4 rounded-campo border border-perigo/70 text-perigo text-sm font-semibold hover:bg-perigo/10 active:translate-y-px",
  // Destrutivo: o botão de CONFIRMAR uma exclusão (ModalConfirmacao).
  // bg-perigo + branco = 5,1:1 (AA) — só existe depois da confirmação aberta;
  // o clique também desce 1px.
  destrutivo:
    "h-11 px-4 rounded-campo bg-perigo text-white text-sm font-semibold hover:brightness-90 active:translate-y-px",
};

interface PropriedadesBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  // Carregando trava o clique e gira um spinner. Sem isto o gestor clica duas
  // vezes no "Salvar" e cria dois registros.
  carregando?: boolean;
}

export function Botao({
  variante = "primario",
  carregando = false,
  disabled = false,
  children,
  className = "",
  ...resto
}: PropriedadesBotao): JSX.Element {
  return (
    <button
      {...resto}
      disabled={disabled || carregando}
      aria-busy={carregando}
      className={`inline-flex items-center justify-center gap-2 font-corpo transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo focus-visible:ring-offset-2 focus-visible:ring-offset-creme disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0 ${ESTILOS[variante]} ${className}`}
    >
      {carregando && <Loader2 size={15} className="motion-safe:animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
