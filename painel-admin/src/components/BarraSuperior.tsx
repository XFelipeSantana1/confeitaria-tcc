import { Link, NavLink, useLocation } from "react-router-dom";
import { PopoverConta } from "./PopoverConta";
import { ContadorMenu } from "./ContadorMenu";
import { MarcaWordmark } from "./MarcaWordmark";
import { ITENS_MENU } from "../lib/menu";

// Barra superior do desktop (4.1): o menu são PALAVRAS sobre o creme — sem
// sidebar, sem ícone, sem pílula. A aba ativa se marca por peso (semibold) e
// pelo sublinhado de 2px em caramelo colado na borda; o resto é textoSuave.
// A cor fica reservada para essa marcação, e é isso.
interface PropriedadesBarraSuperior {
  aoAbrirPerfil: () => void;
  pendentes: number | null;
}

export function BarraSuperior({
  aoAbrirPerfil,
  pendentes,
}: PropriedadesBarraSuperior): JSX.Element {
  // `ativo` calculado do pathname para o aria-current EXPLÍCITO (criterio do
  // cluster). O NavLink também deduz, e as duas leituras coincidem porque as
  // cinco rotas são folhas compartilhando exatamente o path atual.
  const { pathname } = useLocation();

  return (
    <header className="hidden border-b border-borda bg-creme md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-stretch gap-1 px-4 md:px-8">
        {/* O wordmark/lead leva para o Resumo. */}
        <Link
          to="/painel"
          className="flex items-center pr-4"
          aria-label="Doce & Carinho — ir para o Resumo"
        >
          <MarcaWordmark />
        </Link>

        <nav aria-label="Navegação do painel" className="flex flex-1 items-stretch">
          {ITENS_MENU.map((item) => {
            const ativo = pathname === item.rota;
            return (
              <NavLink
                key={item.rota}
                to={item.rota}
                end
                aria-current={ativo ? "page" : undefined}
                className={({ isActive }) =>
                  `relative flex items-stretch px-3 text-sm transition-colors ${
                    isActive ? "font-semibold text-tinta" : "text-textoSuave hover:text-tinta"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-2">
                      {item.rotulo}
                      {/* Contador só existe se houver pendência; zero não
                          desenha (mesma regra do menu antigo). */}
                      {item.contagem === undefined ? null : <ContadorMenu valor={pendentes} />}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3 bottom-0 h-0.5 bg-caramelo ${
                        isActive ? "" : "hidden"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center">
          <PopoverConta aoAbrirPerfil={aoAbrirPerfil} />
        </div>
      </div>
    </header>
  );
}
