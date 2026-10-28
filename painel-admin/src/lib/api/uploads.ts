// Upload de foto do produto.
//
// A foto vai como data URL no corpo JSON em vez de multipart: evita trazer o
// multer (dependência nova) para um recurso usado meia dúzia de vezes, e o
// custo do base64 (33% a mais no corpo) é irrelevante para JPEG de catálogo.

import { ErroApi, requisitar } from "./base";

/** Mesmo teto do backend, validado aqui para falhar antes de subir o arquivo. */
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];

/** Converte o File em data URL, que é o formato que o backend decodifica. */
export function lerComoDataUrl(arquivo: File): Promise<string> {
  return new Promise((resolve, rejeitar) => {
    const leitor = new FileReader();
    leitor.onerror = () => rejeitar(new Error("Não consegui ler o arquivo."));
    leitor.onload = () => resolve(String(leitor.result));
    leitor.readAsDataURL(arquivo);
  });
}

/**
 * Valida antes de enviar. Preferimos avisar na hora em vez de deixar o
 * servidor recusar: o gestor escolheu o arquivo errado e precisa saber agora,
 * não depois de esperar o upload inteiro.
 */
export function validarArquivo(arquivo: File): string | null {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return "Formato não aceito. Use JPG, PNG ou WebP.";
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return "Foto muito grande. O limite é 5 MB.";
  }
  return null;
}

/** POST /api/uploads/imagem -> caminho público da foto salva. */
export async function enviarImagem(token: string, arquivo: File): Promise<string> {
  const problema = validarArquivo(arquivo);
  if (problema !== null) {
    throw new ErroApi(400, problema);
  }
  const imagem = await lerComoDataUrl(arquivo);
  const dados = await requisitar<{ caminho: string }>("/uploads/imagem", token, {
    method: "POST",
    body: JSON.stringify({ imagem, mime: arquivo.type }),
  });
  return dados.caminho;
}
