/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta da casa (briefing do Felipe): fundo creme suave, texto
        // marrom quase preto, terracota queimado como acento principal
        // (preço + botão), dourado suave como secundário, bege neutro.
        tinta: "#2b1e17",
        textoSuave: "#6e5c4e",
        caramelo: "#c4622d",
        carameloForte: "#9c4a1f",
        // Hover de botão primário: mais escuro que carameloForte (hover
        // escurece, nunca clareia) e AA com branco: 8.59:1.
        carameloEscuro: "#7a3a18",
        dourado: "#d4a24c",
        creme: "#fdf8f3",
        areia: "#f4e8d8",
        borda: "#e8ddd1",
        // Estados — os MESMOS três valores do painel: uma casa, uma régua
        // de estado. Na vitrine, `perigo` fala só em erro de FORMULÁRIO
        // (ModalConfiguracoes); erro de rede não é culpa do cliente.
        ok: "#2f6b3f",
        alerta: "#8a5a00",
        perigo: "#a32a2a",
      },
      // Raios do sistema: 12px em campos e botões, 16px em cards, fotos e
      // modais. Nomes explícitos para evitar rounded-3xl na vitrine.
      borderRadius: {
        campo: "12px",
        card: "16px",
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        corpo: ['"DM Sans"', "system-ui", "sans-serif"],
        // Preços e contadores: Manrope com tabular-nums dá alinhamento de
        // tabela num cardápio — igual ao painel, uma identidade só.
        numero: ["Manrope", '"DM Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Única sombra para elementos que flutuam sobre a página (drawer,
        // modal). Cartões comuns separam-se por hairline, não por sombra.
        flutuante:
          "0 18px 50px -12px rgba(43, 30, 23, 0.35), 0 4px 10px -4px rgba(43, 30, 23, 0.12)",
      },
    },
  },
  plugins: [],
};
