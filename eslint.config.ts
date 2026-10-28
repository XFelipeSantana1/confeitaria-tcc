import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // `argsIgnorePattern: ^_` cobre os parâmetros que a assinatura exige mas
      // o corpo não usa — o caso do error handler do Express, que só é
      // reconhecido como tal por ter os quatro parâmetros.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": "off",
    },
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  }
);