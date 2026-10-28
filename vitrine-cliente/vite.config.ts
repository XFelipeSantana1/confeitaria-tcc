import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vitrine pública: sem proxy nem variáveis sensíveis aqui.
// A URL da API é resolvida em tempo de execução (ver src/lib/api.ts),
// então o mesmo build serve contra localhost ou contra a API publicada.
export default defineConfig({
  plugins: [react()],
});
