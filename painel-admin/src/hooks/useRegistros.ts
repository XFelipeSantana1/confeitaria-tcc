import { useCallback, useEffect, useState } from "react";
import type { Registro } from "../types";
import { ErroApi, listarRegistros } from "../lib/api";

// Página de 25: cabe numa rolagem curta e ainda mostra atividade de um mês
// numa confeitaria pequena. O total vem da API (COUNT), não de registros.length
// — sem ele a tela não saberia se existe página seguinte.
const POR_PAGINA = 25;

export function useRegistros(token: string | null): {
  registros: Registro[];
  total: number;
  pagina: number;
  temAnterior: boolean;
  temProxima: boolean;
  carregando: boolean;
  erro: string | null;
  precisaLogin: boolean;
  irParaPagina: (pagina: number) => void;
  buscarNovamente: () => void;
} {
  const [registros, definirRegistros] = useState<Registro[]>([]);
  const [total, definirTotal] = useState(0);
  const [pagina, definirPagina] = useState(0);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState<string | null>(null);
  const [precisaLogin, definirPrecisaLogin] = useState(false);

  const buscar = useCallback(async () => {
    if (!token) {
      definirCarregando(false);
      return;
    }
    definirCarregando(true);
    definirErro(null);
    // Zera a partir de cada busca: sem isso, um 401 isolado deixaria a tela
    // presa no "sair" mesmo depois de a sessão voltar.
    definirPrecisaLogin(false);
    try {
      const dados = await listarRegistros(token, POR_PAGINA, pagina * POR_PAGINA);
      definirRegistros(dados.registros);
      definirTotal(dados.total);
    } catch (falha) {
      if (falha instanceof ErroApi && falha.codigo === 401) {
        definirPrecisaLogin(true);
      } else {
        definirErro(
          falha instanceof Error ? falha.message : "Não foi possível carregar o histórico.",
        );
      }
    } finally {
      definirCarregando(false);
    }
  }, [token, pagina]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  const ultimaPagina = Math.max(Math.ceil(total / POR_PAGINA) - 1, 0);

  return {
    registros,
    total,
    pagina,
    temAnterior: pagina > 0,
    temProxima: pagina < ultimaPagina,
    carregando,
    erro,
    precisaLogin,
    // Clamp: se o gestor apagou registros e a página ficou vazia, voltar para
    // a última existente evita a tela em branco sem registros.
    irParaPagina: (destino: number) => definirPagina(Math.min(Math.max(destino, 0), ultimaPagina)),
    buscarNovamente: buscar,
  };
}
