import { Router } from "express";
import { listar, listarBaixoEstoque, criar, atualizar, movimentar, remover } from "../controllers/insumoController.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();
router.use(autenticar); // tudo aqui é interno ao painel

router.get("/", listar);
router.get("/baixo-estoque", listarBaixoEstoque);
router.post("/", criar);
router.put("/:id", atualizar);
router.post("/:id/movimentar", movimentar);
router.delete("/:id", remover);

export default router;
