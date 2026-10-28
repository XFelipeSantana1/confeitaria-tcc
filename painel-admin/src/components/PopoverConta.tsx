import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { Avatar } from "./Avatar";

// A conta em DOIS lugares agora (topo do desktop e cabeçalho do celular, 4.x):
// botão 44px com disco de foto/inicial + chevron. O painel dentro é o MESMO
// nos dois: nome, "admin", "Meu perfil" e "Sair".
//
// Handler reutilizado da navegação antiga: abrir o perfil continua sendo o
// `aoAbrirPerfil` da EstruturaPainel (a janela mora lá, dois irmãos abrem),
// e `sair` continua vindo de useAutenticacao. A gaveta do MenuMobile morreu;
// o que morou nela de único era exatamente isso, que migrou pra cá.
interface PropriedadesPopoverConta {
  aoAbrirPerfil: () => void;
}

export function PopoverConta({ aoAbrirPerfil }: PropriedadesPopoverConta): JSX.Element {
  const { sessao, sair } = useAutenticacao();
  const { pathname } = useLocation();
  const [aberto, definirAberto] = useState(false);
  const botaoRef = useRef<HTMLButtonElement>(null);

  // Trocar de rota fecha sozinho: o painel aberto atravessando telas é
  // pedestal fantasma (sem devolver foco — o foco já está no conteúdo novo).
  useEffect(() => {
    definirAberto(false);
  }, [pathname]);

  // Esc fecha E devolve o foco ao botão de conta.
  useEffect(() => {
    if (!aberto) return;
    function aoTeclar(evento: KeyboardEvent): void {
      if (evento.key === "Escape") {
        definirAberto(false);
        botaoRef.current?.focus();
      }
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  // Clique fora fecha e devolve o foco ao botão (o overlay é focável).
  function fecharDeFora(): void {
    definirAberto(false);
    botaoRef.current?.focus();
  }

  return (
    <div className="relative">
      <button
        ref={botaoRef}
        onClick={() => definirAberto((valor) => !valor)}
        aria-expanded={aberto}
        aria-controls="painel-da-conta"
        aria-label="Conta"
        className="flex h-11 w-11 items-center justify-center rounded-campo transition-colors hover:bg-areia/60"
      >
        <Avatar
          solo
          nome={sessao?.usuario.nome}
          imagemUrl={sessao?.usuario.imagem_url}
        />
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          aria-hidden="true"
          className={`flex-none text-tinta transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      {aberto ? (
        <>
          {/* Overlay invisível que fecha ao clicar fora — padrão da gaveta
              antiga, agora sem gaveta. */}
          <div className="fixed inset-0 z-40" onClick={fecharDeFora} aria-hidden="true" />
          <div
            id="painel-da-conta"
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-card border border-borda bg-white p-1.5 shadow-flutuante"
          >
            <p className="px-4 py-2.5">
              <b className="block truncate text-sm font-medium text-tinta">
                {sessao?.usuario.nome ?? "—"}
              </b>
              <span className="block text-sm text-textoSuave">
                {sessao?.usuario.cargo ?? "?"}
              </span>
            </p>
            <div className="my-1 h-px bg-borda" />
            <button
              onClick={() => {
                definirAberto(false);
                aoAbrirPerfil();
              }}
              className="block min-h-11 w-full rounded-campo px-4 text-left text-sm text-tinta transition-colors hover:bg-areia/60"
            >
              Meu perfil
            </button>
            <button
              onClick={() => {
                definirAberto(false);
                sair();
              }}
              className="block min-h-11 w-full rounded-campo px-4 text-left text-sm text-tinta transition-colors hover:bg-areia/60"
            >
              Sair
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
