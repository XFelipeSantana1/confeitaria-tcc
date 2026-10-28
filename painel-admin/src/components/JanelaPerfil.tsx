import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useUploadImagem } from "../hooks/useUploadImagem";
import { ErroApi, atualizarPerfil } from "../lib/api";
import { Botao } from "./ui/Botao";
import { CampoImagem } from "./CampoImagem";
import { FormularioSenha } from "./FormularioSenha";
import { Avatar } from "./Avatar";

/**
 * Meu perfil, em janela (5.7).
 *
 * Era página inteira para duas linhas de formulário — e uma tela do menu que
 * nunca era visitada no meio do trabalho. Abre pelo popover de conta.
 *
 * Os dois formulários são independentes de propósito: salvar o nome não pode
 * apagar o que já foi digitado no campo de senha, e vice-versa.
 */
export function JanelaPerfil({ aoFechar }: { aoFechar: () => void }): JSX.Element {
  const { sessao, sair, atualizarUsuario } = useAutenticacao();
  const { enviar: enviarFoto } = useUploadImagem(sessao?.token ?? null);

  const [dados, definirDados] = useState({
    nome: sessao?.usuario.nome ?? "",
    email: sessao?.usuario.email ?? "",
  });
  const [salvando, definirSalvando] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);
  const [ok, definirOk] = useState<string | null>(null);
  // A foto já sobe no momento em que é escolhida, como no produto. Guardar o
  // arquivo em estado até o "Salvar dados" seguraria a imagem em memória
  // durante toda a edição e perderia a foto num refresh acidental.
  const [enviandoFoto, definirEnviandoFoto] = useState(false);

  function limparAvisos(): void {
    definirErro(null);
    definirOk(null);
  }

  async function salvarDados(evento: FormEvent): Promise<void> {
    evento.preventDefault();
    if (!sessao) return;
    definirSalvando(true);
    limparAvisos();
    try {
      const usuario = await atualizarPerfil(sessao.token, {
        nome: dados.nome.trim(),
        email: dados.email.trim(),
      });
      // Atualiza a sessão na hora: a barra superior e o popover mostram o
      // novo nome sem precisar recarregar.
      atualizarUsuario(usuario);
      definirOk("Dados salvos.");
    } catch (falha) {
      definirErro(falha instanceof ErroApi ? falha.message : "Não foi possível salvar.");
    } finally {
      definirSalvando(false);
    }
  }

  async function guardarFoto(caminho: string): Promise<void> {
    if (!sessao) return;
    definirEnviandoFoto(true);
    limparAvisos();
    try {
      const usuario = await atualizarPerfil(sessao.token, { imagem_url: caminho });
      atualizarUsuario(usuario);
      definirOk("Foto atualizada.");
    } catch (falha) {
      definirErro(falha instanceof ErroApi ? falha.message : "Não foi possível enviar a foto.");
    } finally {
      definirEnviandoFoto(false);
    }
  }

  async function removerFoto(): Promise<void> {
    if (!sessao) return;
    definirEnviandoFoto(true);
    limparAvisos();
    try {
      // `null` no corpo, e não string vazia: o backend trata como "remover".
      const usuario = await atualizarPerfil(sessao.token, { imagem_url: null });
      atualizarUsuario(usuario);
      definirOk("Foto removida.");
    } catch (falha) {
      definirErro(falha instanceof ErroApi ? falha.message : "Não foi possível remover a foto.");
    } finally {
      definirEnviandoFoto(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-tinta/50 md:grid md:place-items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Meu perfil"
      onClick={aoFechar}
    >
      <div
        className="flex min-h-dvh w-full flex-col bg-white text-tinta shadow-flutuante md:min-h-0 md:max-h-[calc(100dvh-4rem)] md:max-w-md md:overflow-y-auto md:rounded-card md:border md:border-borda"
        onClick={(evento) => evento.stopPropagation()}
      >
        {/* Topo da 5.7: Avatar de 56px + nome semibold + cargo em textoSuave
            — título de página mão tem vez aqui; a janela é ferramenta. */}
        <header className="flex items-center justify-between gap-3 border-b border-borda p-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              solo
              nome={sessao?.usuario.nome}
              imagemUrl={sessao?.usuario.imagem_url}
              tamanho="lg"
            />
            <div className="min-w-0">
              <b className="block truncate text-lg font-semibold text-tinta">
                {sessao?.usuario.nome ?? "Meu perfil"}
              </b>
              <span className="block text-sm text-textoSuave">
                {sessao?.usuario.cargo ?? "—"}
              </span>
            </div>
          </div>
          <button
            onClick={aoFechar}
            aria-label="Fechar"
            className="grid h-11 w-11 flex-none place-items-center rounded-campo transition-colors hover:bg-areia/60"
          >
            <X size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-5 p-5">
          {erro ? (
            <p role="alert" className="text-sm text-perigo">
              Erro: {erro}
            </p>
          ) : null}
          {ok ? (
            <p role="status" className="text-sm text-ok">
              {ok}
            </p>
          ) : null}

          <CampoImagem
            valor={sessao?.usuario.imagem_url ?? ""}
            rotulo="Foto do perfil"
            proporcao={1}
            textoAjuda="A foto entra no círculo do seu nome, na barra superior e no popover de conta. No celular, o ajuste de recorte aparece depois de escolher a foto."
            aoMudar={(caminho) => void guardarFoto(caminho)}
            aoRemover={() => void removerFoto()}
            aoEnviar={enviarFoto}
            salvando={enviandoFoto}
          />

          {/* Dados da conta como LISTA DE DEFINIÇÃO (5.7): rótulo textoSuave
              à esquerda, valor à direita — aqui o "valor" é o próprio campo
              (continua editável, como antes; hairline separa as linhas). */}
          <form onSubmit={salvarDados} className="flex flex-col gap-3">
            <dl className="flex flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-borda py-2">
                <dt className="text-sm text-textoSuave">Nome</dt>
                <dd className="min-w-0 flex-1">
                  <input
                    id="perfil-nome"
                    value={dados.nome}
                    onChange={(evento) => definirDados({ ...dados, nome: evento.target.value })}
                    autoComplete="name"
                    className="h-11 w-full rounded-campo border border-textoSuave/80 bg-white px-3 font-corpo text-base text-tinta outline-none transition-colors focus:border-caramelo focus:ring-2 focus:ring-caramelo/40"
                  />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-borda py-2">
                <dt className="text-sm text-textoSuave">Email</dt>
                <dd className="min-w-0 flex-1">
                  <input
                    id="perfil-email"
                    type="email"
                    value={dados.email}
                    onChange={(evento) => definirDados({ ...dados, email: evento.target.value })}
                    autoComplete="email"
                    className="h-11 w-full rounded-campo border border-textoSuave/80 bg-white px-3 font-corpo text-base text-tinta outline-none transition-colors focus:border-caramelo focus:ring-2 focus:ring-caramelo/40"
                  />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                {/* Papel não é editável: o cargo vem da sessão. */}
                <dt className="text-sm text-textoSuave">Cargo</dt>
                <dd className="text-sm text-tinta">{sessao?.usuario.cargo ?? "—"}</dd>
              </div>
            </dl>
            <Botao type="submit" carregando={salvando} className="self-start">
              Salvar dados
            </Botao>
          </form>

          <FormularioSenha
            aoAvisar={(mensagem) => {
              definirErro(null);
              definirOk(mensagem);
            }}
            aoErro={(mensagem) => {
              definirOk(null);
              definirErro(mensagem);
            }}
          />
        </div>

        {/* "Sair" no rodapé (5.7) com o MESMO handler do popover de conta:
            o hook de autenticação encerra a sessão, e a janela pode nem
            existir mais depois — o Provedor desmonta por falta de sessão. */}
        <footer className="border-t border-borda p-5">
          <button
            onClick={() => sair()}
            className="-mx-2 min-h-11 px-2 text-sm font-medium text-perigo hover:underline underline-offset-4"
          >
            Sair
          </button>
        </footer>
      </div>
    </div>
  );
}
