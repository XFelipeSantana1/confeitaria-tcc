import { Request, Response } from "express";
import { contar, listar } from "../services/registroService.js";

// Teto de 100 por página: além disso o HTML da tabela fica pesado e ninguém
// rolaria essa lista. O piso é 1 para o LIMIT não receber zero.
const LIMITE_MAXIMO = 100;

// GET /api/registros?limite=&offset= — trilha de auditoria, mais recente
// primeiro. `total` vem junto para o painel saber se existe página seguinte
// sem fazer uma segunda requisição.
export async function listarRegistros(req: Request, res: Response) {
  // Math.floor antes de limitar: ?limite=1.5 chegava ao MySQL como "LIMIT 1.5",
  // que é erro de sintaxe — 500 numa tela que só deveria paginar.
  const limite = Math.min(
    Math.max(Math.floor(Number(req.query.limite)) || 50, 1),
    LIMITE_MAXIMO
  );
  const deslocamento = Math.max(Math.floor(Number(req.query.offset)) || 0, 0);

  const [registros, total] = await Promise.all([listar(limite, deslocamento), contar()]);
  res.json({ registros, total, limite, deslocamento });
}
