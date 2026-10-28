import type { Categoria, Produto, ProdutoBruto } from "../types";

// URL base resolvida em tempo de execução (não no build): o que a pessoa
// digitou na engrenagem ⚙️ ganha do .env, que ganha do localhost padrão.
// Isso permite usar o MESMO build contra o backend local ou o publicado.
// Aceita com ou sem o sufixo /api (cola sozinho quando falta): o erro mais
// comum é colar a URL do Codespaces sem o /api no final.
const URL_PADRAO = "http://localhost:3000/api";
const CHAVE_ARMAZENAMENTO = "cg_api";

function normalizarBase(url: string): string {
  const semBarra = url.trim().replace(/\/+$/, "");
  return semBarra.endsWith("/api") ? semBarra : `${semBarra}/api`;
}

export function obterUrlBase(): string {
  const salva = localStorage.getItem(CHAVE_ARMAZENAMENTO);
  if (salva && salva.trim() !== "") return normalizarBase(salva);
  const doAmbiente = import.meta.env.VITE_API_URL as string | undefined;
  if (doAmbiente && doAmbiente.trim() !== "") return normalizarBase(doAmbiente);
  return URL_PADRAO;
}

export function salvarUrlBase(url: string): void {
  localStorage.setItem(CHAVE_ARMAZENAMENTO, url.trim());
}

// A foto do produto vem como caminho relativo ("/uploads/x.jpg") quando o
// gestor sobe pelo painel. A vitrine roda em outra porta, entao o caminho
// precisa ser prefixado com a base da API -- senao o <img> procura a foto no
// servidor da vitrine e mostra o quadrado cinza. Links absolutos (Unsplash,
// o que ja esta no seed) passam intactos.
export function urlDaImagem(caminho: string | null): string | null {
  if (caminho === null || caminho === "") return null;
  if (/^(https?:)?\/\//.test(caminho) || caminho.startsWith("data:")) return caminho;
  return `${obterUrlBase().replace(/\/api$/, "")}${caminho}`;
}

// Converte o formato bruto da API para o formato usado nos componentes.
// Centralizar aqui evita que cada tela precise lembrar que preco vem string.
export function normalizarProduto(bruto: ProdutoBruto): Produto {
  return {
    id: bruto.id,
    nome: bruto.nome,
    descricao: bruto.descricao ?? "Receita artesanal da casa.",
    preco: Number(bruto.preco) || 0,
    imagemUrl: urlDaImagem(bruto.imagem_url),
    // Sem categoria, `categoria` fica null e lib/secoes joga o produto em
    // "Outros". Antes caía num "Doces" fixo: se existisse uma categoria com
    // esse nome, o doce aparecia como se fosse dela — informação falsa na
    // vitrine, e o balde "Outros" nunca pegava nada.
    categoria: (bruto.categoria as string | null) ?? null,
    ativo: bruto.ativo ?? true,
    disponivel: bruto.disponivel,
    quantidadeDisponivel: bruto.quantidade_disponivel,
  };
}

async function lerJson(resposta: Response, rota: string): Promise<unknown> {
  if (!resposta.ok) {
    throw new Error(`A API respondeu ${resposta.status} em ${rota}.`);
  }
  return resposta.json();
}

// Sem isto o navegador pode responder a recarga com a cópia guardada: o
// gestor ativa o produto, a vitrine recarrega e devolve o cardápio antigo.
// `no-store` obriga a ir na API toda vez — é o que faz o recarregar funcionar.
const AO_BUSCAR = { cache: "no-store" } as const;

/** GET /api/categorias — devolve só os nomes, que é o que as pílulas usam. */
export async function buscarCategorias(): Promise<string[]> {
  const base = obterUrlBase();
  const resposta = await fetch(`${base}/categorias`, AO_BUSCAR);
  const dados = (await lerJson(resposta, "/categorias")) as Categoria[];
  return dados.map((categoria) => categoria.nome);
}

/** GET /api/produtos — cardápio público (o backend já filtra só ativos). */
export async function buscarProdutos(): Promise<Produto[]> {
  const base = obterUrlBase();
  const resposta = await fetch(`${base}/produtos`, AO_BUSCAR);
  const dados = (await lerJson(resposta, "/produtos")) as ProdutoBruto[];
  return dados.map(normalizarProduto);
}

/** GET /api/health — usada pelo botão "Testar API" da configuração. */
/**
 * Testa uma URL sem gravar nada.
 *
 * Recebe a URL como parâmetro de propósito: quando ela vinha do localStorage,
 * o botão "Testar API" gravava o valor novo ANTES de checar, e um endereço
 * errado já ficava salvo — a vitrine quebrava no próximo carregamento e o
 * teste "só" informava que não deu.
 */
export async function testarConexao(url: string): Promise<boolean> {
  const resposta = await fetch(`${normalizarBase(url)}/health`);
  const dados = (await lerJson(resposta, "/health")) as { status?: string };
  return dados.status === "ok";
}
