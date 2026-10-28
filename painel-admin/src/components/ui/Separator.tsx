// Hairline simples entre seções: linha fina em borda, ponto final.
// O pontinho dourado central saiu — ornamento rodando solto competia com
// a única cor de ação do painel, e a separação por espaço já existe.
interface PropriedadesSeparator {
  className?: string;
}

export function Separator({ className = "" }: PropriedadesSeparator): JSX.Element {
  return <div className={`my-8 h-px bg-borda ${className}`} />;
}
