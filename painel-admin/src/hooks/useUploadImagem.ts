import { useCallback, useState } from "react";
import { ErroApi, enviarImagem as enviarParaApi } from "../lib/api";

// Foto do produto: escolhe o arquivo, sobe na hora e devolve o caminho.
//
// Fica em hook próprio (e não dentro do useJanelaProduto) porque tem um
// estado de erro diferente: falha de upload NÃO é falha de salvamento. Se
// morasse no mesmo lugar, o modal abriria o erro de "não consegui salvar o
// produto" quando o problema era só a foto — e o gestor acharia que perdeu
// o cadastro inteiro.
export function useUploadImagem(token: string | null): {
  enviar: (arquivo: File) => Promise<string>;
} {
  const [tokenAtual, definirToken] = useState<string | null>(token);

  // O token muda quando o gestor loga de novo; guardar em estado mantém o
  // hook estável sem capturar um token que já expirou na primeira chamada.
  if (token !== tokenAtual) {
    definirToken(token);
  }

  const enviar = useCallback(
    async (arquivo: File): Promise<string> => {
      if (tokenAtual === null) {
        throw new ErroApi(401, "Sua sessão expirou. Entre de novo para enviar a foto.");
      }
      return enviarParaApi(tokenAtual, arquivo);
    },
    [tokenAtual],
  );

  return { enviar };
}
