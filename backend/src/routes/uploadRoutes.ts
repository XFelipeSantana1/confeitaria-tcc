import { Router } from "express";
import { enviarImagem } from "../controllers/uploadController.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();

// Upload de foto do produto. Exige JWT: quem sobe arquivo é o gestor, e a rota
// sem token deixaria qualquer visitante escrever no disco do servidor.
router.post("/imagem", autenticar, enviarImagem);

export default router;
