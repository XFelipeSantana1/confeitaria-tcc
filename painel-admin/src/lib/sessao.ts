import type { Sessao } from "../types";

// Guarda da sessão: mesmo trio do protótipo (salvar/obter/limpar), para as
// telas futuras reutilizarem sem reinventar login em cada página.
const CHAVE = "cg_sessao";

export function salvarSessao(sessao: Sessao): void {
  localStorage.setItem(CHAVE, JSON.stringify(sessao));
}

export function obterSessao(): Sessao | null {
  try {
    const texto = localStorage.getItem(CHAVE);
    if (!texto) return null;
    const dados = JSON.parse(texto) as Partial<Sessao>;
    if (!dados.token || !dados.usuario) return null;
    return dados as Sessao;
  } catch {
    return null;
  }
}

export function limparSessao(): void {
  localStorage.removeItem(CHAVE);
}
