import "dotenv/config";
import crypto from "node:crypto";
import { Request, Response, NextFunction } from "express";

/**
 * Compara em tempo constante.
 *
 * O `!==` comum devolve assim que acha o primeiro byte diferente, e essa
 * diferença de tempo serve de oráculo para descobrir a chave um byte por
 * vez. Passar os dois textos por SHA-256 antes resolve: os digests têm sempre
 * 32 bytes, então a comparação é de tamanho fixo e não depende do segredo.
 */
function iguais(a: string, b: string): boolean {
  return crypto.timingSafeEqual(
    crypto.createHash("sha256").update(a).digest(),
    crypto.createHash("sha256").update(b).digest(),
  );
}

export function validarApiKeyBot(req: Request, res: Response, next: NextFunction) {
  // Fail-closed de propósito: sem chave configurada, a rota do bot responde
  // 500 em vez de ficar aberta. Rota aberta criaria pedidos e baixaria
  // estoque sem nenhuma autenticação.
  if (!process.env.BOT_API_KEY) {
    return res.status(500).json({ erro: "Bot não configurado no servidor." });
  }
  const chave = req.headers["x-api-key"];
  if (typeof chave !== "string" || !iguais(chave, process.env.BOT_API_KEY)) {
    return res.status(401).json({ erro: "Chave de API do bot inválida." });
  }
  next();
}