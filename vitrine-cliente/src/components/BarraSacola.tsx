import { ShoppingBasket } from "lucide-react";
import { formatarMoeda } from "../lib/formatarMoeda";

/**
 * Barra fixa do rodapé com o resumo da sacola.
 *
 * Só no celular, e só quando há item. No desktop não entra porque a sacola já
 * está sempre visível na barra do cabeçalho, com o contador — repetir o número
 * em dois lugares da mesma tela só obriga a cliente a decidir qual é o
 * verdadeiro. No celular o cabeçalho mostra só o número, e o preço (a parte que
 * interessa) ficava três telas abaixo, dentro de um botão que ela precisava
 * lembrar de procurar.
 *
 * Por isso a barra mostra as três coisas juntas: o que fazer ("Ver sacola"), o
 * quanto ("2 itens") e por quanto ("R$ 24,00"). Com só o contador, o número não
 * diz se vale a pena continuar.
 */
export function BarraSacola({
  unidades,
  total,
  aoAbrir,
}: {
  unidades: number;
  total: number;
  aoAbrir: () => void;
}): JSX.Element | null {
  // Sacola vazia: a barra some. Uma barra fixa pedindo "ver sacola · 0 itens ·
  // R$ 0,00" ocupa a tela para não informar nada.
  if (unidades === 0) return null;

  return (
    // Encostada de vez: largura total, sem margem lateral, sem raio e sem
    // sombra. Barra fixa que alcança as bordas é o padrão do comércio no
    // celular — a versão flutuante, com margem de 12px, lia como um botão
    // avulso pousado sobre o conteúdo (o relato de uso foi exatamente "a
    // sacola não fica no canto"). Sem sombra, além do relato, por regra do
    // redesign: encostada não flutua, não pede profundidade.
    <div className="fixed inset-x-0 bottom-0 z-30 md:hidden print:hidden">
      {/*
        O vão de baixo extra (env(safe-area-inset-bottom)) continua, mas
        DENTRO do botão: é o que segura o alvo de toque acima do gesto de
        navegação do Android — sem ele, a barra morre sob o gesto.
      */}
      <button
        onClick={aoAbrir}
        className="flex w-full items-center gap-3 bg-carameloForte px-4 py-3 text-white transition-colors hover:bg-carameloEscuro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-creme"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <ShoppingBasket size={19} strokeWidth={1.5} className="flex-none" aria-hidden="true" />
        {/* As três partes na MESMA escala (todas text-sm): o total herdava
            16px do corpo da página ao lado de dois 14px — é isso que formava
            a "escada" de letras vista no celular, comparada com a faixa de
            garantias (onde tudo é text-sm). */}
        <span className="flex-1 text-left font-corpo text-sm font-semibold">
          Ver sacola
        </span>
        <span className="flex-none font-corpo text-sm">
          {unidades} {unidades === 1 ? "item" : "itens"}
        </span>
        {/* `font-numero` + `tabular-nums`: Manrope com dígitos de largura
            fixa. O comentário antigo dizia que a vitrine não define esta
            fonte — foi verdade só até a Etapa 1.1 adicionar o Manrope aqui
            também; hoje os dois apps definem, e o preço alinha sem perder a
            largura estável a cada item. */}
        <span
          className="flex-none font-numero text-sm font-semibold tabular-nums"
          aria-label={`total ${formatarMoeda(total)}`}
        >
          {formatarMoeda(total)}
        </span>
      </button>
    </div>
  );
}