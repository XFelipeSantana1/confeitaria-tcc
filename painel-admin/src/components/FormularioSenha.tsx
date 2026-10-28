import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { ErroApi, atualizarPerfil } from "../lib/api";
import { Botao } from "./ui/Botao";
import { Entrada } from "./ui/Entrada";

interface PropriedadesFormularioSenha {
  aoAvisar: (mensagem: string) => void;
  aoErro: (mensagem: string) => void;
}

/**
 * Troca de senha, isolada do resto da janela.
 *
 * Fica em arquivo próprio porque os campos precisam começar VAZIOS sempre que
 * a janela abre: quem erra a senha atual não pode sair, corrigir o nome e
 * voltar para descobrir que a caixa ainda mostra a senha antiga. Montando o
 * formulário dentro da janela, o `useState` sobreviveria à segunda abertura.
 */
export function FormularioSenha({
  aoAvisar,
  aoErro,
}: PropriedadesFormularioSenha): JSX.Element {
  const { sessao } = useAutenticacao();
  const [senhas, definirSenhas] = useState({ atual: "", nova: "" });
  const [salvando, definirSalvando] = useState(false);
  // Mostrar a senha é um recurso de acessibilidade, não de depuração: com
  // `type="password"` fixo, quem tem dificuldade de ler os caracteresDigitados
  // (PONV não é erro comum) não consegue conferir o que escreveu antes de
  // enviar — e descobrir o erro só depois da troca é tarde.
  const [visivel, definirVisivel] = useState(false);

  async function enviar(evento: FormEvent): Promise<void> {
    evento.preventDefault();
    if (!sessao) return;
    definirSalvando(true);
    try {
      await atualizarPerfil(sessao.token, {
        senha_atual: senhas.atual,
        senha_nova: senhas.nova,
      });
      // Limpa os campos: a senha antiga não pode ficar escrita no formulário
      // depois de trocar, e o vazio avisa que foi preciso.
      definirSenhas({ atual: "", nova: "" });
      // Volta a esconder: a senha nova já foi salva e não precisa ficar à vista.
      definirVisivel(false);
      aoAvisar("Senha trocada.");
    } catch (falha) {
      aoErro(falha instanceof ErroApi ? falha.message : "Não foi possível trocar a senha.");
    } finally {
      definirSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3 border-t border-borda pt-4">
      {/* Título de seção em DM Sans — sem ícone: a seção tem etiqueta, não
          botão; a palavra é o recado. */}
      <h3 className="text-lg font-semibold text-tinta">Alterar senha</h3>
      <Entrada
        id="perfil-atual"
        rotulo="Senha atual"
        type={visivel ? "text" : "password"}
        value={senhas.atual}
        onChange={(evento) => definirSenhas({ ...senhas, atual: evento.target.value })}
        autoComplete="current-password"
      />
      <div className="flex justify-end">
        {/* O olho VOLTOU por pedido do uso (C8.2): com o mesmo ícone no
            login, a função "mostrar/ocultar senha" ficou reconhecível nos
            dois lugares — ícone + palavra, e o aria-pressed conta o estado.
            A palavra continua PORQUE o nome da ação precisa ser legível sem
            depender da decodificação do ícone. */}
        <button
          type="button"
          onClick={() => definirVisivel((v) => !v)}
          aria-pressed={visivel}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-carameloForte transition-colors hover:underline underline-offset-4"
        >
          {visivel ? (
            <EyeOff size={16} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Eye size={16} strokeWidth={1.5} aria-hidden="true" />
          )}
          {visivel ? "Esconder" : "Mostrar"} a senha
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Entrada
          id="perfil-nova"
          rotulo="Nova senha"
          type={visivel ? "text" : "password"}
          value={senhas.nova}
          onChange={(evento) => definirSenhas({ ...senhas, nova: evento.target.value })}
          autoComplete="new-password"
        />
        <p className="text-sm text-textoSuave">Mínimo de 6 caracteres.</p>
      </div>
      <Botao type="submit" carregando={salvando} className="self-start">
        Salvar nova senha
      </Botao>
    </form>
  );
}
