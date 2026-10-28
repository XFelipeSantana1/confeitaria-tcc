import { Router } from "express";
import { listar, buscarPorId, atualizarStatus, atualizarPagamento } from "../controllers/pedidoController.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();
router.use(autenticar); // pedidos só são consultados/gerenciados logado

router.get("/", listar);
router.get("/:id", buscarPorId);
router.patch("/:id/status", atualizarStatus);
router.patch("/:id/pagamento", atualizarPagamento);

export default router;
