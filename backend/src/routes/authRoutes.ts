import { Router } from "express";
import { login, registrar, me, atualizarPerfil } from "../controllers/authController.js";
import { autenticar, autenticarOpcional } from "../middleware/auth.js";

const router = Router();
router.post("/login", login);
// Registro: livre só no bootstrap (base vazia); depois exige JWT de admin
// (verificação feita dentro do controller). Opcional preenche req.usuario
// quando há token, sem bloquear quem ainda vai criar o primeiro acesso.
router.post("/registrar", autenticarOpcional, registrar);
router.get("/me", autenticar, me);
router.put("/me", autenticar, atualizarPerfil);


export default router;
