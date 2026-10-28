import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

// Botão da vitrine na língua da casa (o espelhado do painel C8.1): o primário
// ganhou "borda de corte" na base — peso de coisa clicável, sem sombra —, a
// prensa desce 1px (nunca escala: o pulinho de scale balançava o alvo, e a
// página inteira somou esse relato) e o foco é SEMPRE visível, com anel
// caramelo. `whats` é o mesmo primário no tom de texto da gaveta; o TEXTO de
// finalização nunca muda por este componente.
type VarianteBotao = "escura" | "clara" | "whats";

const ESTILOS: Record<VarianteBotao, string> = {
  // Primário: carameloForte (6.15:1 com branco, AA) + corte carameloEscuro.
  // Hover ESCURECE (8.59:1) e a borda se funde com o fundo — intencional.
  escura:
    "bg-carameloForte text-white border-b-2 border-carameloEscuro hover:bg-carameloEscuro active:translate-y-px",
  // Secundária: branca com hairline, hover areia. Responde sem competir.
  clara:
    "bg-white text-tinta border border-borda hover:bg-areia active:translate-y-px",
  whats:
    "bg-carameloForte text-creme border-b-2 border-carameloEscuro hover:bg-carameloEscuro active:translate-y-px",
};

interface PropriedadesBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  // Carregando = o botão está trabalhando. Gira um spinner, trava o clique e
  // avisa para leitor de tela: sem isso, dá para disparar a ação 5 vezes.
  carregando?: boolean;
}

export function Botao({
  variante = "escura",
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
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-campo px-6 py-3 font-corpo text-sm font-semibold transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo/40 focus-visible:ring-offset-2 focus-visible:ring-offset-creme disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0 ${ESTILOS[variante]} ${className}`}
    >
      {carregando && (
        <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
