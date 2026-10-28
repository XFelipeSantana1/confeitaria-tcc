import "dotenv/config";

/**
 * Confere o `.env` antes de o servidor subir.
 *
 * Sem isto, uma chave faltando ou ainda no placeholder só aparecia quando o
 * primeiro login era tentado — como 500 no `jwt.sign`, que não diz nada
 * sobre a causa. Falhar no boot, com o nome da variável, é mais barato de
 * diagnosticar do que procurar depois.
 */

/** Marcadores que não podem valer como segredo em ambiente nenhum. */
const PLACEHOLDERS = [
  "troque_por_uma_chave",
  "troque",
  "changeme",
  "secret",
  "senha",
];

/** Aborta o processo com a lista de problemas, em vez de um por vez. */
export function conferirEnv(): void {
  const problemas: string[] = [];

  for (const nome of ["DB_USER", "DB_PASSWORD", "DB_NAME"]) {
    if (!process.env[nome]) problemas.push(`${nome} não está definida no .env`);
  }

  const segredo = process.env.JWT_SECRET ?? "";
  if (segredo.length === 0) {
    problemas.push("JWT_SECRET não está definida no .env");
  } else if (segredo.length < 32) {
    problemas.push(`JWT_SECRET tem só ${segredo.length} caracteres (mínimo 32)`);
  } else if (PLACEHOLDERS.some((m) => segredo.toLowerCase().includes(m))) {
    problemas.push("JWT_SECRET ainda é o valor de exemplo do .env.example");
  }

  if (problemas.length === 0) return;

  console.error("[api] .env inválido — o servidor não vai subir:");
  for (const problema of problemas) console.error(`  - ${problema}`);
  process.exit(1);
}