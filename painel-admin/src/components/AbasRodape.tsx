import { NavLink, useLocation } from "react-router-dom";
import { ITENS_MENU } from "../lib/menu";
import { ContadorMenu } from "./ContadorMenu";

// Barra inferior do celular, na lição da Vercel (só o padrão, não a sidebar):
// 5 abas de largura igual, ícone de 20px ACIMA do rótulo sempre visível, uso
// com uma mão. A aba ativa se marca por texto (semibold + tinta) e por um
// traço de 2px em caramelo no topo — sem pílula preenchida, sem fundo.
//
// A antiga gaveta (MenuMobile) morreu: navegar é aqui, e perfil/sair foram
// para o PopoverConta do cabeçalho, com os mesmos handlers de antes.
export function AbasRodape({ pendentes }: { pendentes: number | null }): JSX.Element {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Navegação do painel"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-creme pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid grid-cols-5">
        {ITENS_MENU.map((item) => {
          const Icone = item.icone;
          const ativo = pathname === item.rota;
          return (
            <NavLink
              key={item.rota}
              to={item.rota}
              end
              aria-current={ativo ? "page" : undefined}
              className={({ isActive }) =>
                `relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-xs transition-colors ${
                  isActive ? "font-semibold text-tinta" : "text-textoSuave"
                } md:text-xs`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-2 top-0 h-0.5 bg-caramelo ${
                      isActive ? "" : "hidden"
                    }`}
                  />
                  <Icone size={20} strokeWidth={1.5} aria-hidden="true" />
                  {/* O contador fica ao lado do rótulo — sobrepor no ícone
                      escondia o alvo do toque (era sobreposto; agora é
                      legível, como no desktop). */}
                  <span className="flex items-center gap-1">
                    {item.rotulo}
                    {item.contagem === undefined ? null : <ContadorMenu valor={pendentes} />}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
