import type { ReactNode } from "react";

// Cabeçalho padrão das telas (título de página + ação à direita).
// O sobretítulo em caixa-alta saiu ("PRODUTOS" acima de "Produtos" dizia
// duas vezes a mesma coisa): 3.3 remove eyebrows de página, exceto a data
// do Resumo — que nem passa por aqui.
interface PropriedadesCabecalhoSecao {
  titulo: string;
  acao?: ReactNode;
}

export function CabecalhoSecao({ titulo, acao }: PropriedadesCabecalhoSecao): JSX.Element {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-tinta md:text-3xl">
        {titulo}
      </h1>
      {acao}
    </div>
  );
}
