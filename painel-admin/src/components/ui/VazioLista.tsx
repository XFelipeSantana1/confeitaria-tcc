// Estado vazio de uma lista: UMA linha de texto, alinhada à esquerda.
// Sem ícone, sem disco, sem centralizar — vazio de ferramenta é uma frase
// que diz o que fazer, não um balão decorado ocupando a mesma tela.
// As frases continuam as de antes; só o palco que encolheu.
interface PropriedadesVazioLista {
  texto: string;
  className?: string;
}

export function VazioLista({ texto, className = "" }: PropriedadesVazioLista): JSX.Element {
  return <p className={`text-sm text-textoSuave ${className}`}>{texto}</p>;
}
