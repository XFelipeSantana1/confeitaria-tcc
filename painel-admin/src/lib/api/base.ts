// Base compartilhada das chamadas à API. Fica num arquivo só porque é o
// único lugar que sabe: a URL base, o header de token e o formato do erro.

/**
 * Em desenvolvimento a base é RELATIVA ("/api"): o navegador pede para a
 * própria origem do painel e o proxy do Vite repassa para o backend dentro do
 * Codespaces (ver vite.config.ts). Isso é o que faz o login funcionar — a URL
 * pública da API não serve, porque a porta 3000 é repassada como porta
 * privada e o túnel responde 401 antes da requisição chegar no Express.
 *
 * No build de produção não existe proxy, então aí sim vale a URL do `.env`.
 */
const DO_AMBIENTE = import.meta.env.VITE_API_URL as string | undefined;
const BASE: string = import.meta.env.DEV
  ? "/api"
  : DO_AMBIENTE || "http://localhost:3000/api";

/** Erro com status HTTP, para a tela decidir a mensagem (401 expira sessão). */
export class ErroApi extends Error {
  codigo: number;
  constructor(codigo: number, mensagem: string) {
    super(mensagem);
    this.codigo = codigo;
  }
}

/** Sinaliza que a requisição foi cancelada de propósito (AbortController). */
export class RequisicaoCancelada extends Error {
  constructor() {
    super("Requisição cancelada.");
    this.name = "RequisicaoCancelada";
  }
}

/** GET/POST/PUT/PATCH autenticado: já joga o Bearer e traduz erro 4xx/5xx. */
export async function requisitar<T>(
  rota: string,
  token: string,
  opcoes?: RequestInit,
): Promise<T> {
  const resposta = await fetch(`${BASE}${rota}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opcoes?.headers ?? {}),
    },
  });
  const corpo = (await resposta.json().catch(() => ({}))) as {
    erro?: string;
  };
  // Requisição abortada é cancelamento, não erro: quem cancelou já sabe, e
  // traduzir para ErroApi faria a tela mostrar falha onde não houve nenhuma.
  if (resposta.status === 499 || (corpo as { cancelado?: boolean }).cancelado) {
    throw new RequisicaoCancelada();
  }
  if (!resposta.ok) {
    throw new ErroApi(
      resposta.status,
      corpo.erro ?? `A API respondeu ${resposta.status}.`,
    );
  }
  return corpo as T;
}

/**
 * A URL que o `img` usa para abrir a foto.
 *
 * O backend devolve um caminho relativo ("/uploads/x.jpg") porque ele não sabe
 * por qual host o painel está sendo acessado — no Codespaces o host muda a
 * cada sessão. Aqui o painel troca pela BASE, que é a mesma origem da API.
 *
 * Em desenvolvimento a BASE é "/api", então o `.replace` deixa a string vazia e
 * o resultado é "/uploads/x.jpg": mesma origem do painel, e o proxy do Vite
 * repassa. Não dá para usar a URL pública da API aqui pelas mesmas razões do
 * login: a porta 3000 é privada e o túnel responde 401.
 */
/**
 * Converte o TINYINT do MySQL em booleano de verdade.
 *
 * `Boolean("0")` é `true`: se o driver (ou um proxy no caminho) devolver o
 * valor como string, todo produto desativado voltaria a aparecer como
 * "Visível" no painel — e a vitrine continuaria mostrando o que o gestor
 * jurou ter escondido.
 */
export function ehVerdadeiro(valor: unknown): boolean {
  if (typeof valor === "boolean") return valor;
  if (typeof valor === "number") return valor !== 0;
  if (typeof valor === "string") return valor === "1" || valor.toLowerCase() === "true";
  return false;
}

export function urlPublica(caminho: string): string {
  if (caminho === "" || /^(https?:)?\/\//.test(caminho) || caminho.startsWith("data:")) {
    return caminho;
  }
  return `${BASE.replace(/\/api$/, "")}${caminho}`;
}

export { BASE };
