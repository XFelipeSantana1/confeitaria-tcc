import type { ReactNode } from "react";

/**
 * Botão de ação de linha (CELULAR). 44×44 com o rótulo em aria-label e
 * title: a linha não tem coluna de ações, então sem ele o gestor não
 * saberia o que o ícone faz. No desktop as ações são LINKS DE TEXTO
 * (specs 5.3/5.4) e este botão não entra.
 */
export function BotaoAcao({
  onClick,
  rotulo,
  disabled = false,
  className = "",
  children,
}: {
  onClick: () => void;
  rotulo: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={rotulo}
      title={rotulo}
      className={`grid h-11 w-11 flex-none place-items-center rounded-campo transition-colors hover:bg-areia disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-transparent ${className}`}
    >
      {children}
    </button>
  );
}
