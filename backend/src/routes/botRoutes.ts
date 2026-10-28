import { Router } from "express";
import { criarViaBot } from "../controllers/pedidoController.js";

const router = Router();
// Sem "autenticar" (JWT) - quem chama é o serviço do bot, protegido
// por API key própria (ver middleware apiKeyBot.ts, aplicado no server.ts)
router.post("/pedidos", criarViaBot);

export default router;
