import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { ErroApi } from "../lib/api";
import { Botao } from "../components/ui/Botao";
import { Entrada } from "../components/ui/Entrada";
import { MarcaLogin } from "../components/MarcaLogin";

// Mesmo padrão do lib/api/base.ts para ler variável de ambiente: indefinida
// cai no endereço local. (Não é segredo exposto: é a vitrine do MESMO site.)
const URL_VITRINE = import.meta.env.VITE_URL_VITRINE as string | undefined;

export function Entrar(): JSX.Element {
  const { entrarComSenha } = useAutenticacao();
  const navegar = useNavigate();
  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");
  // Olhinho (pedido do uso): conferir a senha antes de apertar Entrar. O
  // padrão vem do FormularioSenha (mostrar/ocultar é acessibilidade, não
  // depuração) — aqui o controle mora DENTRO do campo, porque o login só tem
  // ele; no perfil a palavra carrega, porque mora sob o campo.
  const [senhaVisivel, definirSenhaVisivel] = useState(false);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);

  async function aoEnviar(evento: FormEvent): Promise<void> {
    evento.preventDefault();
    if (!email.trim() || !senha) {
      definirErro("Informe email e senha.");
      return;
    }
    definirCarregando(true);
    definirErro(null);
    try {
      await entrarComSenha(email.trim(), senha);
      navegar("/painel", { replace: true });
    } catch (falha) {
      definirErro(
        falha instanceof ErroApi && falha.codigo === 401
          ? "Email ou senha incorretos. Tente novamente."
          : falha instanceof Error
            ? falha.message
            : "Não foi possível entrar. Verifique a conexão.",
      );
    } finally {
      definirCarregando(false);
    }
  }

  return (
    // `min-h-dvh` (não `min-h-screen`): no celular, 100vh conta a barra de
    // endereço — a página media MAIS do que o visível e entregava uma
    // rolagem fantasma mesmo cabendo tudo (relato de uso). `dvh` mede a
    // viewport dinâmica, o que se vê de verdade.
    <div className="flex min-h-dvh flex-col font-corpo md:grid md:grid-cols-2">
      {/* Lado da marca: desktop e faixa mobile — UM componente, sem cópias. */}
      <MarcaLogin />
      <MarcaLogin compacta />

      {/* Formulário DIRETO no creme (5.6): sem cartão, sem foto. No desktop
          encosta à ESQUERDA da coluna (não é caixa centralizada); no celular
          o bloco centraliza com margens iguais. max-w-sm é a senha de
          conforto de leitura. */}
      <div className="flex flex-1 items-center justify-center bg-creme px-4 py-10 md:justify-start md:px-16 md:py-16">
        <form onSubmit={aoEnviar} className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-tinta">
            Entrar no painel
          </h1>
          <p className="mt-1 text-sm text-textoSuave">
            Acesso restrito à gestão da confeitaria
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <Entrada
              id="email"
              rotulo="Email"
              type="email"
              autoComplete="username"
              placeholder="voce@confeitaria.com"
              value={email}
              onChange={(evento) => definirEmail(evento.target.value)}
            />
            <Entrada
              id="senha"
              rotulo="Senha"
              type={senhaVisivel ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={senha}
              onChange={(evento) => definirSenha(evento.target.value)}
              acessorio={
                <button
                  type="button"
                  onClick={() => definirSenhaVisivel(!senhaVisivel)}
                  aria-pressed={senhaVisivel}
                  aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                  title={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                  className="grid h-full w-11 place-items-center rounded-r-campo text-textoSuave transition-colors hover:bg-areia/60 hover:text-tinta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-caramelo/40"
                >
                  {senhaVisivel ? (
                    <EyeOff size={16} strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Eye size={16} strokeWidth={1.5} aria-hidden="true" />
                  )}
                </button>
              }
            />
          </div>

          <Botao type="submit" carregando={carregando} className="mt-6 w-full">
            {carregando ? "Entrando…" : "Entrar"}
          </Botao>

          {/* Erro ABAIXO do botão (5.6), em TEXTO de perigo — a cor é o
              marcador, sem faixa: quem errou lê a palavra primeiro. */}
          {erro ? (
            <p role="alert" className="mt-3 text-sm text-perigo">
              Erro: {erro}
            </p>
          ) : null}

          {/* Metadados de conta separados do formulário por hairline, à
              ESQUERDA (a tela inteira é alinhada à esquerda). "Fale com a
              gestora" é texto puro: era um <span> com hover de link, o que
              fingia ter uma ação que não existe (não há redefinição de senha
              no backend). */}
          <div className="mt-8 flex flex-col items-start gap-2 border-t border-borda pt-6">
            <p className="text-xs text-textoSuave">
              Esqueceu a senha? Fale com a gestora da confeitaria.
            </p>
            {/* Anchor real, não botão + navigate: o destino é OUTRA aplicação
                (a vitrine), e <a> honra gastura de teclado (clique do meio,
                "abrir em nova aba"), bookmark e histórico — que SPA não faz. */}
            <a
              href={URL_VITRINE ?? "http://localhost:5173"}
              className="text-sm font-medium text-textoSuave transition-colors hover:text-tinta"
            >
              Voltar para a vitrine
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
