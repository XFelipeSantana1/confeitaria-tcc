/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tinta: "#2b1e17",
        textoSuave: "#6e5c4e",
        caramelo: "#c4622d",
        carameloForte: "#9c4a1f",
        // Hover de botão primário. Precisa ficar MAIS escuro que o
        // carameloForte (hover escurece, nunca clareia) e passar AA com
        // branco: chega a 8.59:1 (carameloForte fica em 6.15:1).
        carameloEscuro: "#7a3a18",
        dourado: "#d4a24c",
        creme: "#fdf8f3",
        areia: "#f4e8d8",
        borda: "#e8ddd1",
        // Cores de estado (legíveis sobre o creme, sem verde/vermelho
        // genéricos): estoque/ok 6,0:1 · atenção 5,6:1 · perigo 6,8:1.
        // Estado SEMPRE vem com texto ao lado — a cor é reforço, não recado.
        ok: "#2f6b3f",
        alerta: "#8a5a00",
        perigo: "#a32a2a",
      },
      // Raios do sistema: 12px em campos e botões, 16px em cards, fotos e
      // modais. `rounded-xl`/`rounded-2xl` já valem os mesmos valores, mas
      // os nomes tornam a intenção explícita e evitam rounded-3xl.
      borderRadius: {
        campo: "12px",
        card: "16px",
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        corpo: ['"DM Sans"', "system-ui", "sans-serif"],
        // Números e micro-rótulos: grotesca técnica (Manrope) passa precisão
        // de ferramenta profissional; serifada fica nos títulos de marca.
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
