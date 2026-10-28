import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Upload de foto de produto.
//
// Decisão: a imagem chega como base64 no corpo JSON, e não como multipart.
// Motivo: multipart exigiria trazer o multer (dependência nova) para um
// recurso que a confeitaria usa meia dúzia de vezes. O base64 passa pelo
// express.json que já existe, e o custo é o arquivo inchar 33% — irrelevante
// para JPEG de 300 KB.
//
// A pasta fica FORA do versionamento: são fotos do cliente, não código.

// Onde as fotos ficam. `process.cwd()` é a pasta de onde o backend foi
// iniciado — no Codespace, `backend/`. Vira caminho absoluto na primeira vez,
// então não importa a partir de onde o comando foi digitado.
const PASTA_UPLOAD = path.resolve(process.cwd(), "uploads");

// 5 MB. Acima disso não é foto de cardápio: é outra coisa, e o express.json
// segura o corpo em memória antes do handler ver.
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

// Só três formatos, porque o `<img>` renderiza todos e o resto (TIFF, BMP,
// SVG) é peso ou vetor de script sem ganho nenhum aqui.
const TIPOS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export interface ResultadoUpload {
  caminho: string;
}

/**
 * Grava a imagem e devolve o caminho público.
 *
 * O nome do arquivo é SEMPRE gerado aqui (UUID), nunca vindo do cliente: o
 * nome enviado pode conter "../" e sair da pasta, ou ter acentos que quebram
 * a URL depois. Só a extensão vem da lista acima.
 */
export async function salvarImagem(dadosBase64: string, mime: string): Promise<ResultadoUpload> {
  const extensao = TIPOS[mime];
  if (extensao === undefined) {
    throw new ErroUpload("Formato não aceito. Use JPG, PNG ou WebP.");
  }

  // O data URL vem como "data:image/jpeg;base64,XXXX" — corta o prefixo.
  const conteudo = dadosBase64.includes(",")
    ? dadosBase64.slice(dadosBase64.indexOf(",") + 1)
    : dadosBase64;

  const bytes = Buffer.from(conteudo, "base64");

  if (bytes.length === 0) {
    throw new ErroUpload("O arquivo veio vazio.");
  }
  // Confia no tamanho decodificado, não no texto enviado: base64 mente fácil.
  if (bytes.length > TAMANHO_MAXIMO) {
    throw new ErroUpload("Foto muito grande. O limite é 5 MB.");
  }

  await mkdir(PASTA_UPLOAD, { recursive: true });
  const nomeArquivo = `${randomUUID()}${extensao}`;
  await writeFile(path.join(PASTA_UPLOAD, nomeArquivo), bytes);

  return { caminho: `/uploads/${nomeArquivo}` };
}

export class ErroUpload extends Error {
  status: number;
  constructor(mensagem: string) {
    super(mensagem);
    this.status = 400;
  }
}

export { PASTA_UPLOAD, TAMANHO_MAXIMO };
