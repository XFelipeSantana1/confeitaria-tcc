import { MarcaWordmark } from "./MarcaWordmark";

// Lado da marca da tela de login (5.6): SEM foto, SEM gradiente, SEM faixa
// translúcida. O desktop é uma coluna AREIA LISA com o lockup pregado no
// canto inferior esquerdo (flex items-end p-12) — a página inteira respira
// papel; a marca fala com tipografia, não com paisagem.
//
// No celular o wordmark vira uma faixa no topo, à esquerda — o rótulo de
// página; o resto da tela é o formulário.
export function MarcaLogin({ compacta = false }: { compacta?: boolean }): JSX.Element {
  return (
    <div
      aria-hidden={compacta ? undefined : "true"}
      className={
        compacta
          ? "bg-areia px-5 py-4 md:hidden"
          : "hidden items-end bg-areia p-12 md:flex"
      }
    >
      <div className="flex flex-col gap-3">
        <MarcaWordmark grande={!compacta} />
        <p
          className={
            compacta
              ? "text-xs text-textoSuave"
              : "text-sm leading-relaxed text-textoSuave"
          }
        >
          Painel da confeitaria
        </p>
      </div>
    </div>
  );
}
