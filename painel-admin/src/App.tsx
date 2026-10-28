import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProvedorAutenticacao } from "./hooks/useAutenticacao";
import { RotaProtegida } from "./components/RotaProtegida";
import { EstruturaPainel } from "./components/EstruturaPainel";
import { Entrar } from "./pages/Entrar";
import { Resumo } from "./pages/Resumo";
import { Pedidos } from "./pages/Pedidos";
import { Insumos } from "./pages/Insumos";
import { Produtos } from "./pages/Produtos";
import { Registros } from "./pages/Registros";

// Rotas do painel: /entrar (pública) e /painel/* (protegidas).
// Próximas telas entram como filhas de EstruturaPainel:
// /painel/pedidos, /painel/insumos, /painel/produtos.
export default function App(): JSX.Element {
  return (
    <ProvedorAutenticacao>
      <BrowserRouter>
        <Routes>
          <Route path="/entrar" element={<Entrar />} />
          <Route element={<RotaProtegida />}>
            <Route element={<EstruturaPainel />}>
              <Route path="/painel" element={<Resumo />} />
              <Route path="/painel/pedidos" element={<Pedidos />} />
              <Route path="/painel/insumos" element={<Insumos />} />
              <Route path="/painel/produtos" element={<Produtos />} />
              <Route path="/painel/registros" element={<Registros />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/painel" replace />} />
        </Routes>
      </BrowserRouter>
    </ProvedorAutenticacao>
  );
}
