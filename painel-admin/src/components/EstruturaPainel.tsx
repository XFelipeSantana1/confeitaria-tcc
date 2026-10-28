import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { usePedidosPendentes } from "../hooks/usePedidosPendentes";
import { BarraSuperior } from "./BarraSuperior";
import { AbasRodape } from "./AbasRodape";
import { PopoverConta } from "./PopoverConta";
import { MarcaWordmark } from "./MarcaWordmark";
import { JanelaPerfil } from "./JanelaPerfil";

// Moldura das telas logadas, contra o molde novo do redesign:
// DESKTOP = barra superior de textos (BarraSuperior), sem coluna fixa, com
// conteúdo centralizado em max-w-5xl. CELULAR = cabeçalho com wordmark +
// conta, conteúdo em px-4 e abas fixas embaixo (AbasRodape).
//
// A sidebar escura e a gaveta do cellular saíram: navegação por TEXTO, e a
// cor fica para ação e estado.
//
// A janela de perfil continua morando aqui — quem a abre agora é o popover
// de conta (que é único nos dois tamanhos de tela).
export function EstruturaPainel(): JSX.Element {
  const { sessao } = useAutenticacao();
  const [perfilAberto, definirPerfilAberto] = useState(false);
  // Uma consulta só para os lugares que mostram o número (barra superior e
  // abas do rodapé). Buscar dentro de cada um faria a mesma requisição duas
  // vezes em toda tela.
  const pendentes = usePedidosPendentes(sessao?.token ?? null);
  const abrirPerfil = () => definirPerfilAberto(true);

  return (
    // `dvh` e não `vh`: 100vh conta a barra de endereço do celular e sobrava
    // rolagem fantasma (o mesmo que o login recebeu).
    <div className="flex min-h-dvh flex-col bg-creme font-corpo">
      <BarraSuperior aoAbrirPerfil={abrirPerfil} pendentes={pendentes} />

      {/* Cabeçalho do celular: wordmark à esquerda, conta à direita — a mesma
          popover de conta do desktop; sem gaveta, sem hamburger. */}
      <header className="flex h-14 flex-none items-center justify-between border-b border-borda bg-creme px-4 md:hidden">
        <Link to="/painel" aria-label="Doce & Carinho — ir para o Resumo">
          <MarcaWordmark pequena />
        </Link>
        <PopoverConta aoAbrirPerfil={abrirPerfil} />
      </header>

      <main className="w-full flex-1 px-4 pb-24 pt-6 md:mx-auto md:max-w-5xl md:px-8 md:pb-8 md:pt-8">
        <Outlet />
      </main>

      <AbasRodape pendentes={pendentes} />

      {perfilAberto ? <JanelaPerfil aoFechar={() => definirPerfilAberto(false)} /> : null}
    </div>
  );
}
