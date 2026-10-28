import express from "express";
import cors from "cors";
import "dotenv/config";
import "express-async-errors"; // faz erros de controllers async (throw) chegarem no middleware de erro abaixo

import authRoutes from "./routes/authRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import insumoRoutes from "./routes/insumoRoutes.js";
import produtoRoutes from "./routes/produtoRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";
import botRoutes from "./routes/botRoutes.js";
import registroRoutes from "./routes/registroRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { validarApiKeyBot } from "./middleware/apiKeyBot.js";
import { mensagemDoErro } from "./lib/erros.js";
import { PASTA_UPLOAD, TAMANHO_MAXIMO } from "./services/uploadService.js";
import { conferirEnv } from "./config/env.js";
import { origensPermitidas } from "./config/origens.js";

// Falha agora, com o nome da variável, em vez de virar 500 no primeiro login.
conferirEnv();

const app = express();

// O corpo em base64 incha 33%: uma foto de 5 MB vira ~6,7 MB de JSON. O teto
// do express precisa caber esse inchaço, senao o body parser derruba a
// requisição ANTES do service ver o arquivo e o painel receberia um 500 sem
// dizer nada -- em vez do "foto muito grande" que ele sabe explicar.
const LIMITE_CORPO = `${Math.ceil(((TAMANHO_MAXIMO * 4) / 3) * 1.1 / (1024 * 1024))}mb`;
app.use(express.json({ limit: LIMITE_CORPO }));

// CORS por lista, não liberado para todo mundo. A lista (e o motivo de ela
// existir) estão em config/origens.ts.
console.log(`[api] CORS liberado para: ${origensPermitidas().join(", ")}`);
app.use(cors({ origin: origensPermitidas() }));

// Fotos de produto. Servir por rota (e não por CDN externo) porque o `img` da
// vitrine aponta direto para cá e a imagem precisa sobreviver ao deploy.
app.use("/uploads", express.static(PASTA_UPLOAD, { maxAge: "7d" }));

// O cardápio muda no painel e a vitrine precisa refletir na hora. O ETag do
// Express faria o navegador responder "não mudou" a partir do conteúdo, o que
// é correto tecnicamente e errado aqui: o cliente espera ver o doce novo
// assim que o gestor ativa. Só nas leituras públicas — dado do gestor (com
// JWT) pode ser cacheado sem risco.
app.use("/api/produtos", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use("/api/categorias", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/insumos", insumoRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/registros", registroRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/bot", validarApiKeyBot, botRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Middleware de erro central: qualquer "throw" dentro de um
// controller async cai aqui, em vez de derrubar o servidor.
// Precisa ter os 4 parâmetros (err, req, res, next) para o Express
// reconhecer como error handler.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Corpo grande demais é erro de NEGÓCIO, não de servidor: o arquivo chegou
  // grande demais e a resposta tem que dizer isso. Sem este caso o painel
  // receberia 500 e mostraria "tente de novo" para algo que só se resolve
  // escolhendo uma foto menor.
  if ((err as { type?: string } | null)?.type === "entity.too.large") {
    return res.status(413).json({ erro: "Foto muito grande. O limite é 5 MB." });
  }
  console.error("[api]", mensagemDoErro(err));
  res.status(500).json({ erro: "Erro interno no servidor." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
