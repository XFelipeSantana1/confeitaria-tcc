import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Sessao, Usuario } from "../types";
import { entrar, obterUsuario } from "../lib/api";
import { limparSessao, obterSessao, salvarSessao } from "../lib/sessao";

// Sessão global do painel: login, validação do token salvo e saída.
// As páginas consomem via useAutenticacao() em vez de ler localStorage direto.
interface ValorAutenticacao {
  sessao: Sessao | null;
  verificando: boolean;
  entrarComSenha: (email: string, senha: string) => Promise<void>;
  atualizarUsuario: (usuario: Usuario) => void;
  sair: () => void;
}

const Contexto = createContext<ValorAutenticacao | null>(null);

export function ProvedorAutenticacao({ children }: { children: ReactNode }): JSX.Element {
  const [sessao, definirSessao] = useState<Sessao | null>(null);
  // Começa true: evita piscar a tela de login antes de validar o token.
  const [verificando, definirVerificando] = useState(true);

  // Na montagem, valida o token guardado (sessão expirada volta ao login).
  useEffect(() => {
    async function validar(): Promise<void> {
      const salva = obterSessao();
      if (!salva) {
        definirVerificando(false);
        return;
      }
      try {
        const usuario = await obterUsuario(salva.token);
        const renovada = { token: salva.token, usuario };
        salvarSessao(renovada);
        definirSessao(renovada);
      } catch {
        limparSessao();
        definirSessao(null);
      } finally {
        definirVerificando(false);
      }
    }
    validar();
  }, []);

  const entrarComSenha = useCallback(async (email: string, senha: string) => {
    const nova = await entrar(email, senha);
    salvarSessao(nova);
    definirSessao(nova);
  }, []);

  const sair = useCallback(() => {
    limparSessao();
    definirSessao(null);
  }, []);

  // Reflete edição de perfil na hora (sidebar mostra o nome novo sem relogar).
  const atualizarUsuario = useCallback(
    (usuario: Usuario) => {
      definirSessao((atual) => {
        if (!atual) return atual;
        const nova = { ...atual, usuario };
        salvarSessao(nova);
        return nova;
      });
    },
    [],
  );

  const valor = useMemo(
    () => ({ sessao, verificando, entrarComSenha, atualizarUsuario, sair }),
    [sessao, verificando, entrarComSenha, atualizarUsuario, sair],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAutenticacao(): ValorAutenticacao {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("useAutenticacao só funciona dentro do Provedor.");
  return valor;
}
