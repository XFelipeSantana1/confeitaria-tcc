import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Painel do gestor (área logada). O token JWT vai no header Authorization
// (ver src/lib/api.ts).
//
// O proxy abaixo existe porque o painel roda dentro do Codespaces e é aberto
// pelo navegador de quem desenvolve, que está FORA do Codespaces. Se o
// navegador chamasse a API pela URL pública dela, duas coisas quebrariam:
// a porta 3000 é repassada como porta privada (o túnel responde 401 antes de a
// requisição chegar no Express) e o CORS deixaria de ser same-origin. Com o
// proxy, o navegador fala só com a porta 5173 e é o Vite — que está do lado de
// dentro, onde `localhost:3000` funciona — que repassa para o backend.
//
// Vale para /api e para /uploads, senão as fotos do produto não carregam.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/uploads": "http://localhost:3000",
    },
  },
});
