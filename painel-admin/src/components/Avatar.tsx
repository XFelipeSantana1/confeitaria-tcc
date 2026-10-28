import { urlPublica } from "../lib/api";

interface PropriedadesAvatar {
  nome: string | undefined;
  cargo?: string | null;
  imagemUrl?: string | null;
  /** Botão em vez de <span>, para abrir o perfil. */
  aoClicar?: () => void;
  tamanho?: "md" | "sm" | "lg";
  /** SÓ o disco (foto/inicial): botão de conta da barra superior, onde o
   *  nome mora dentro do popover e não ao lado. */
  solo?: boolean;
}

/**
 * Nome do gestor com foto quando tem, inicial quando não.
 *
 * A inicial continua existindo porque `imagem_url` pode ser null e um quadrado
 * vazio ali parece quebrado. O disco não é mais carameloForte cheio: caramelo
 * é cor de AÇÃO, e o avatar não pede ação — inicial em Playfair sobre areia.
 *
 * `overflow`/`object-cover`: sem ele, uma foto deitada esticava o círculo.
 */
export function Avatar({
  nome,
  cargo = null,
  imagemUrl = null,
  aoClicar,
  tamanho = "md",
  solo = false,
}: PropriedadesAvatar): JSX.Element {
  const classeCirculo =
    tamanho === "sm" ? "h-9 w-9 text-sm" : tamanho === "lg" ? "h-14 w-14 text-xl" : "h-9 w-9 text-base";
  const conteudo = imagemUrl ? (
    <img
      src={urlPublica(imagemUrl)}
      alt=""
      className={`${classeCirculo} flex-none rounded-full object-cover`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`grid ${classeCirculo} flex-none place-items-center rounded-full bg-areia font-display text-tinta`}
    >
      {(nome ?? "?").charAt(0).toUpperCase()}
    </span>
  );

  if (solo) {
    return <>{conteudo}</>;
  }

  if (aoClicar === undefined) {
    return (
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {conteudo}
        <span className="min-w-0 flex-1">
          <b className="block truncate text-sm">{nome}</b>
          {cargo ? <span className="block text-xs text-textoSuave">{cargo}</span> : null}
        </span>
      </span>
    );
  }

  return (
    <button
      onClick={aoClicar}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-campo text-left transition-colors hover:bg-areia/30"
    >
      {conteudo}
      <span className="min-w-0 flex-1">
        <b className="block truncate text-sm">{nome}</b>
        {cargo ? <span className="block text-xs text-textoSuave">{cargo}</span> : null}
      </span>
    </button>
  );
}
