import { Navigate, Outlet } from "react-router-dom";
import { useAutenticacao } from "../hooks/useAutenticacao";

// Guarda das rotas logadas: sem sessão volta ao /entrar; verificando mostra
// espera (não decide antes de validar o token salvo).
export function RotaProtegida(): JSX.Element {
  const { sessao, verificando } = useAutenticacao();
  if (verificando) {
    return (
      <div className="grid min-h-screen place-items-center bg-creme font-corpo text-textoSuave">
        Conferindo sua sessão…
      </div>
    );
  }
  if (!sessao) return <Navigate to="/entrar" replace />;
  return <Outlet />;
}
