// Botão que abre o explorador de arquivos e aceita arrastar.
//
// Saiu do corpo do CampoImagem porque os manipuladores de drag entalhavam o
// JSX: eram 20 linhas de evento no meio do layout, e quem abrisse o arquivo
// para mudar o campo era obrigado a ler tudo antes de achar a foto.
//
// Visual da 5.3: área de upload retangular DE PONTOS (border-dashed em
// textoSuave/80) com o rótulo "Escolher foto"/"Trocar a foto" em caixa
// normal — sem ícone (o sinal de pontilhado já diz "solte aqui").
import { Loader2 } from "lucide-react";

interface PropriedadesBotaoEscolher {
  occupado: boolean;
  enviando: boolean;
  arrastando: boolean;
  trocou: boolean;
  aoClicar: () => void;
  aoArrastarSobre: () => void;
  aoSair: () => void;
  aoSoltar: (arquivo: File | undefined) => void;
}

export function BotaoEscolher({
  occupado,
  enviando,
  arrastando,
  trocou,
  aoClicar,
  aoArrastarSobre,
  aoSair,
  aoSoltar,
}: PropriedadesBotaoEscolher): JSX.Element {
  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={occupado}
      onDragOver={(evento) => {
        // Sem preventDefault o navegador abre o arquivo numa aba nova em vez
        // de soltar no campo.
        evento.preventDefault();
        aoArrastarSobre();
      }}
      onDragLeave={aoSair}
      onDrop={(evento) => {
        evento.preventDefault();
        aoSoltar(evento.dataTransfer.files[0]);
      }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-campo border border-dashed px-4 text-sm font-medium transition-colors disabled:opacity-60 ${
        arrastando
          ? "border-caramelo bg-areia text-tinta"
          : "border-textoSuave/80 bg-white text-tinta hover:border-caramelo hover:bg-areia/40"
      }`}
    >
      {enviando ? (
        <Loader2 size={15} strokeWidth={1.5} className="motion-safe:animate-spin" aria-hidden="true" />
      ) : null}
      {trocou ? "Trocar a foto" : "Escolher foto"}
    </button>
  );
}
