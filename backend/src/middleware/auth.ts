import jwt from "jsonwebtoken";
import "dotenv/config";
import { Request, Response, NextFunction } from "express";

/** O que o painel lê do token. É o payload assinado no login. */
export interface UsuarioDoToken {
  id: number;
  nome?: string;
  email: string;
  cargo: string;
}

export interface RequisicaoAutenticada extends Request {
  // `nome` entrou no payload do token para a trilha de auditoria mostrar quem
  // fez a operação sem consultar o banco a cada registro.
  usuario?: UsuarioDoToken;
}

/**
 * `jwt.verify` devolve `string | JwtPayload`, e o payload tem index signature
 * aberta — por isso `any` era o jeito mais fácil, e também o mais perigoso:
 * `req.usuario.id` virava `any` em todos os controllers e um token forjado
 * com outra forma passava sem ninguém perceber. Aqui o payload é conferido
 * campo a campo antes de virar `UsuarioDoToken`.
 */
function comoUsuario(payload: string | jwt.JwtPayload): UsuarioDoToken | null {
  if (typeof payload === "string") return null;
  const { id, nome, email, cargo } = payload as Record<string, unknown>;
  if (typeof id !== "number" || typeof email !== "string" || typeof cargo !== "string") {
    return null;
  }
  return { id, nome: typeof nome === "string" ? nome : undefined, email, cargo };
}

export function autenticar(req: RequisicaoAutenticada, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não informado." });
  }

  const [esquema, token] = authHeader.split(" ");
  if (esquema !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Formato do token inválido. Use: Bearer <token>." });
  }

  try {
    const usuario = comoUsuario(jwt.verify(token, process.env.JWT_SECRET as string));
    if (usuario === null) {
      return res.status(401).json({ erro: "Token inválido ou expirado." });
    }
    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

// Variação que NÃO bloqueia requisições sem token: apenas preenche
// req.usuario quando o token é válido. Usada pelo registrar para permitir
// o bootstrap do primeiro usuário (base vazia) sem deixar a rota aberta
// depois que já existem usuários.
export function autenticarOpcional(req: RequisicaoAutenticada, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")?.[1];
  if (token) {
    try {
      const usuario = comoUsuario(jwt.verify(token, process.env.JWT_SECRET as string));
      if (usuario !== null) req.usuario = usuario;
    } catch {
      // Token inválido aqui é ignorado de propósito: o controller decide
      // o que fazer (a rota de registro exige admin quando já há usuários).
    }
  }
  next();
}