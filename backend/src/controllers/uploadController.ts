import { Response } from "express";
import { ErroUpload, salvarImagem } from "../services/uploadService.js";
import type { RequisicaoAutenticada } from "../middleware/auth.js";

// POST /api/uploads/imagem -> { caminho: "/uploads/xxx.jpg" }
//
// O arquivo vem como data URL no corpo JSON, não como multipart: evitar o
// multer (dependência nova) vale os 33% a mais que o base64 acrescenta, já que
// a foto é uma de cada produto. O tamanho é limitado no app.ts (express.json).
export async function enviarImagem(req: RequisicaoAutenticada, res: Response) {
  const { imagem, mime } = req.body ?? {};

  if (typeof imagem !== "string" || imagem === "") {
    return res.status(400).json({ erro: "Nenhuma imagem foi enviada." });
  }
  if (typeof mime !== "string" || mime === "") {
    return res.status(400).json({ erro: "Formato da imagem não informado." });
  }

  try {
    const { caminho } = await salvarImagem(imagem, mime);
    res.status(201).json({ caminho });
  } catch (falha) {
    if (falha instanceof ErroUpload) {
      return res.status(falha.status).json({ erro: falha.message });
    }
    throw falha;
  }
}
