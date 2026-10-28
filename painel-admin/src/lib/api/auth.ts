// Sessão do gestor: login (não pede token), validação e perfil.

import type { Sessao, Usuario } from "../../types";
import { ErroApi, requisitar, BASE } from "./base";

/** POST /api/auth/login — não pede token (é assim que se consegue um). */
export async function entrar(email: string, senha: string): Promise<Sessao> {
  const resposta = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  const corpo = (await resposta.json().catch(() => ({}))) as Partial<Sessao> & {
    erro?: string;
  };
  if (!resposta.ok || !corpo.token || !corpo.usuario) {
    throw new ErroApi(resposta.status, corpo.erro ?? "Não foi possível entrar.");
  }
  return { token: corpo.token, usuario: corpo.usuario };
}

/** GET /api/auth/me — confirma que o token salvo ainda vale. */
export async function obterUsuario(token: string): Promise<Usuario> {
  return requisitar<Usuario>("/auth/me", token);
}

/** PUT /api/auth/me — nome/email, foto e troca de senha (com senha atual). */
export async function atualizarPerfil(
  token: string,
  dados: {
    nome?: string;
    email?: string;
    imagem_url?: string | null;
    senha_atual?: string;
    senha_nova?: string;
  },
): Promise<Usuario> {
  return requisitar<Usuario>("/auth/me", token, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}
