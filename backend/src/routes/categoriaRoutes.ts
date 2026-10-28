import { Router } from "express";
import { listar, criar, atualizar, remover } from "../controllers/categoriaController.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();
router.get("/", listar);               // público - vitrine precisa listar categorias
router.post("/", autenticar, criar);
router.put("/:id", autenticar, atualizar);
router.delete("/:id", autenticar, remover);

export default router;
