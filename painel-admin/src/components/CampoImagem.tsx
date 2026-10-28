import { useRef, useState, type ChangeEvent } from "react";
import { Loader2 } from "lucide-react";
import { Botao } from "./ui/Botao";
import { BotaoEscolher } from "./ui/BotaoEscolher";
import { urlPublica, validarArquivo } from "../lib/api";

// Campo de foto.
//
// Clique abre o explorador/galeria do sistema. No celular, o seletor nativo
// JÁ TRAZ o ajuste de recorte — é o "cortar" do próprio Android/iOS, depois
// de escolher a foto. Por isso não existe painel de recorte aqui: construí um
// e ele dava mais trabalho do que tomava da pessoa, e fechava sozinho
// quando a imagem demorava a carregar.
//
// O que este campo faz é o que o seletor nativo não faz: prévia dedicada,
// erro de formato/tamanho na hora, e envio direto.
//
// A lista de tipos é explícita de propósito: com `image/*` o iOS oferece HEIC,
// que o backend recusa (ele só grava JPG, PNG e WebP). Pedir a lista certa faz
// o sistema converter antes de entregar o arquivo.
interface PropriedadesCampoImagem {
  valor: string;
  rotulo: string;
  /**
   * Único uso: 1 = prévia redonda, formato do avatar do perfil (JanelaPerfil).
   * Fora do perfil a prévia é o quadradinho 96×96 da 5.3, e este valor não
   * muda nada — a proporção do card antigo não existe mais.
   */
  proporcao?: number;
  textoAjuda?: string;
  aoMudar: (caminho: string) => void;
  /** Como o botão Remover deve remover. O perfil entrega o handler que manda
   *  `null` (o SÓ aceita removido como null); o resto usa aoMudar(""). */
  aoRemover?: () => void;
  // Devolve o caminho salvo: quem chamou é quem já tem o estado do formulário
  // e quem mostra a pré-visualização, então o upload não precisa conhecer o
  // valor atual — só devolvê-lo.
  aoEnviar: (arquivo: File) => Promise<string>;
  salvando: boolean;
}

export function CampoImagem({
  valor,
  rotulo,
  proporcao = 4 / 3,
  textoAjuda,
  aoMudar,
  aoRemover,
  aoEnviar,
  salvando,
}: PropriedadesCampoImagem): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, definirArrastando] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);
  const [enviando, definirEnviando] = useState(false);

  async function processar(arquivo: File | undefined): Promise<void> {
    if (!arquivo) return;
    const problema = validarArquivo(arquivo);
    if (problema !== null) {
      definirErro(problema);
      return;
    }
    definirErro(null);
    definirEnviando(true);
    try {
      aoMudar(await aoEnviar(arquivo));
    } catch (falha) {
      definirErro(falha instanceof Error ? falha.message : "Não consegui enviar a foto.");
    } finally {
      definirEnviando(false);
    }
  }

  function escolher(evento: ChangeEvent<HTMLInputElement>): void {
    // O campo é zerado depois: sem isso, escolher o MESMO arquivo duas vezes
    // não dispara onChange e o gestor acha que o botão quebrou.
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    void processar(arquivo);
  }

  const occupado = enviando || salvando;
  const circular = proporcao === 1;

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="text-sm font-medium text-tinta">{rotulo}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={escolher}
        className="sr-only"
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        {/* Prévia: 96×96 no produto; redonda 80px só no perfil (avatar). */}
        <div
          className={`relative flex-none overflow-hidden bg-areia/50 ${
            circular
              ? "h-20 w-20 rounded-full border border-borda"
              : "h-24 w-24 rounded-campo border border-borda"
          }`}
        >
          {valor !== "" ? (
            <img
              src={urlPublica(valor)}
              alt={`Pré-visualização de ${rotulo.toLowerCase()}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="grid h-full place-items-center text-[11px] text-textoSuave">
              sem foto
            </span>
          )}
          {enviando && (
            <span
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center bg-tinta/35"
            >
              <Loader2 size={22} strokeWidth={1.5} className="motion-safe:animate-spin text-white" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <BotaoEscolher
              occupado={occupado}
              enviando={enviando}
              arrastando={arrastando}
              trocou={valor !== ""}
              aoClicar={() => inputRef.current?.click()}
              aoArrastarSobre={() => definirArrastando(true)}
              aoSair={() => definirArrastando(false)}
              aoSoltar={(arquivo) => {
                definirArrastando(false);
                void processar(arquivo);
              }}
            />
            {valor !== "" && (
              <Botao
                type="button"
                variante="perigo"
                onClick={() => (aoRemover ? aoRemover() : aoMudar(""))}
                disabled={occupado}
                aria-label={`Remover ${rotulo.toLowerCase()}`}
              >
                Remover
              </Botao>
            )}
          </div>
          <p className="text-xs leading-relaxed text-textoSuave">
            {textoAjuda ??
              "Clique ou arraste a imagem. JPG, PNG ou WebP até 5 MB. No celular, o ajuste de recorte aparece depois de escolher a foto."}
          </p>
        </div>
      </div>

      {erro !== null && (
        <span role="alert" className="text-sm text-perigo">
          Erro: {erro}
        </span>
      )}
    </div>
  );
}
