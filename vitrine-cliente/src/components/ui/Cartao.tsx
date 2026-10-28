import type { ReactNode } from "react";

// Moldura padrão dos blocos da vitrine (cards de produto, destaques, seções
// do cardápio). Separação por HAIRLINE (border-borda), nunca por sombra:
// sombra fica reservada a drawer e modal (token `flutuante`).
//
// `elevacao` continua aceita para não quebrar os chamadores atuais, mas os
// três níveis renderizam a MESMA caixa; a prop sai junto com os usos quando
// as telas forem refeitas (etapa 2).
type Elevacao = "suave" | "medio" | "alto";

const SOMBRAS: Record<Elevacao, string> = {
  suave: "",
  medio: "",
  alto: "",
};

interface PropriedadesCartao {
  children: ReactNode;
  className?: string;
  elevacao?: Elevacao;
}

export function Cartao({
  children,
  className = "",
  elevacao = "suave",
}: PropriedadesCartao): JSX.Element {
  return (
    <div
      className={`rounded-card border border-borda bg-white p-6 ${SOMBRAS[elevacao]} ${className}`}
    >
      {children}
    </div>
  );
}
