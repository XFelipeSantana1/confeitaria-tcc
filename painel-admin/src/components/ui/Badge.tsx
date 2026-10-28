import type { ReactNode } from "react";

// Estado de linha (a antiga "Badge" de pílula): MARCADOR de cor + TEXTO,
// sempre os dois — cor sozinha não dá conta de daltônico, de leitor de tela
// nem de screenshot. Sem pílula, sem fundo, sem caixa-alta: linha de tabela
// que informa estado, não etiqueta decorativa.
//
// O texto fica em TINHA e o marcador carrega a cor; as duas exceções da spec
// ("Abaixo do mínimo" e "Cancelado") usam o texto na própria cor do estado.
type TomEstado = "ok" | "alerta" | "perigo" | "suave" | "acao";

const CORES_MARCADOR: Record<TomEstado, string> = {
  ok: "bg-ok",
  alerta: "bg-alerta",
  perigo: "bg-perigo",
  suave: "bg-textoSuave",
  acao: "bg-carameloForte",
};

const CORES_TEXTO: Record<TomEstado, string> = {
  ok: "text-tinta",
  alerta: "text-alerta",
  perigo: "text-perigo",
  suave: "text-tinta",
  acao: "text-tinta",
};

interface PropriedadesEstado {
  tom?: TomEstado;
  className?: string;
  children: ReactNode;
}

export function Estado({
  tom = "suave",
  className = "",
  children,
}: PropriedadesEstado): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-medium ${CORES_TEXTO[tom]} ${className}`}
    >
      <span aria-hidden="true" className={`size-2 flex-none rounded-full ${CORES_MARCADOR[tom]}`} />
      {children}
    </span>
  );
}
