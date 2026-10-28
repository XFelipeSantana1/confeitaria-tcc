import type { InputHTMLAttributes, ReactNode } from "react";

// Campo de formulário do painel (rótulo + input com erro opcional). Fundo
// BRANCO (superfície elevada das 3.1), borda em textoSuave/80 — `borda`
// (#e8ddd1) não alcança os 3:1 que campo exige. Texto em 16px para o iOS não
// dar zoom no foco (campos de celular).
interface PropriedadesEntrada extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string;
  erroCampo?: string | null;
  /** Acessório DENTRO do campo, à direita (ex.: o olhinho de senha). O
      consumidor entrega um <button> pronto; o campo só reserva o vão
      (pr-12) e pousa o acessório sobre a margem, sem mexer no foco do
      input. */
  acessorio?: ReactNode;
}

export function Entrada({
  rotulo,
  erroCampo,
  acessorio,
  id,
  className = "",
  ...resto
}: PropriedadesEntrada): JSX.Element {
  const invalido = Boolean(erroCampo);
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm font-medium text-tinta">
      {rotulo}
      <span className="relative block">
        <input
          id={id}
          aria-invalid={invalido || undefined}
          className={`h-11 w-full rounded-campo border bg-white px-3 font-corpo text-base text-tinta outline-none placeholder:text-textoSuave/60 focus:border-caramelo focus:ring-2 focus:ring-caramelo/40 ${
            acessorio ? "pr-12" : ""
          } ${invalido ? "border-perigo" : "border-textoSuave/80"} ${className}`}
          {...resto}
        />
        {acessorio ? (
          <span className="absolute inset-y-0 right-0 flex">{acessorio}</span>
        ) : null}
      </span>
      {/* A palavra "Erro:" abre a mensagem: quem só ouve (ou só li o texto)
          entra pelo motivo direto, sem adivinhar qual campo falhou. */}
      {erroCampo ? <span className="text-perigo">Erro: {erroCampo}</span> : null}
    </label>
  );
}
