import { Router } from "express";
import { listarRegistros } from "../controllers/registroController.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();

// Trilha de auditoria: só o gestor logado lê. Não é pública porque mostra o
// nome de quem fez cada operação — informação interna da loja.
router.get("/", autenticar, listarRegistros);

export default router;
