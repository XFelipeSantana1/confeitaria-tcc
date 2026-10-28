import type { ReactNode } from "react";

// Padrão do painel mudou: listas e tabelas não moram mais dentro de caixas
// brancas arredondadas — ficam DIRETO sobre o creme, separadas por hairline.
// O padrão da propriedade é esse: seção sem moldura (border-t no topo).
//
// `moldura` é a exceção EXPLÍCITA para superfície elevada de verdade
// (corpos dentro de drawer/modal). Nenhum cartão arredondado deve restar
// solto em página; se aparecer, é para passar pelo modal, não pela prop.
interface PropriedadesCartao {
  children: ReactNode;
  /** Classes Tailwind extras (largura, scroll etc.). */
  className?: string;
  /** Superfície branca elevada — só onde já existe drawer/modal por trás. */
  moldura?: boolean;
}

export function Cartao({
  children,
  className = "",
  moldura = false,
}: PropriedadesCartao): JSX.Element {
  return (
    <div
      className={
        moldura
          ? `rounded-card border border-borda bg-white p-6 ${className}`
          : `border-t border-borda pt-4 ${className}`
      }
    >
      {children}
    </div>
  );
}
