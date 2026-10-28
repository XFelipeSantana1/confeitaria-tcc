import { Router } from "express";
import {
  listarPublico,
  listarTodos,
  buscarPorIdAdmin,
  criar,
  atualizar,
  atualizarFichaTecnica,
  maisVendidos,
  remover,
} from "../controllers/produtoController.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();

// Rotas do painel primeiro: evita qualquer colisão futura com "/:id"
// (hoje já funciona por nº de segmentos, mas ordem explícita é robusta).
router.get("/admin/todos", autenticar, listarTodos);
router.get("/admin/mais-vendidos", autenticar, maisVendidos);
router.get("/admin/:id", autenticar, buscarPorIdAdmin);

// Rotas públicas -> vitrine do cliente (detalhe SEM ficha técnica)
router.get("/", listarPublico);


router.post("/", autenticar, criar);
router.put("/:id", autenticar, atualizar);
router.put("/:id/ficha-tecnica", autenticar, atualizarFichaTecnica);
router.delete("/:id", autenticar, remover);

export default router;
